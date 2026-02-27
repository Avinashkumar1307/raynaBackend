import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { Document, DocumentChunk, CSVRow } from './types';
import { EmbeddingService } from './embedding.service';
import { VectorService } from './vector.service';

export class DataIngestionService {
  private embeddingService: EmbeddingService;
  private vectorService: VectorService;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.vectorService = new VectorService();
  }

  /**
   * Ingest data from CSV file into vector database
   */
  async ingestFromCSV(csvFilePath?: string): Promise<void> {
    const filePath = csvFilePath || config.rag.csvFilePath;
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    console.log(`[DataIngestion] Starting ingestion from: ${filePath}`);

    try {
      // Initialize Pinecone index
      await this.vectorService.initializeIndex();

      // Parse CSV and convert to documents
      const documents = await this.parseCSV(filePath);
      console.log(`[DataIngestion] Parsed ${documents.length} documents from CSV`);

      // Chunk documents
      const chunks = this.chunkDocuments(documents);
      console.log(`[DataIngestion] Created ${chunks.length} chunks`);

      // Generate embeddings for chunks
      await this.generateEmbeddingsForChunks(chunks);

      // Upsert to Pinecone
      await this.vectorService.upsertChunks(chunks);

      console.log(`[DataIngestion] Successfully ingested ${chunks.length} chunks into vector database`);
    } catch (error) {
      console.error('[DataIngestion] Failed to ingest data:', error);
      throw error;
    }
  }

  /**
   * Parse CSV file and convert to documents
   */
  private async parseCSV(filePath: string): Promise<Document[]> {
    return new Promise((resolve, reject) => {
      const documents: Document[] = [];
      const rows: CSVRow[] = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row: CSVRow) => {
          rows.push(row);
        })
        .on('end', () => {
          try {
            // Convert CSV rows to documents
            // This function should be customized based on your CSV structure
            const docs = this.convertRowsToDocuments(rows);
            resolve(docs);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Convert CSV rows to documents
   * Customize this method based on your CSV structure
   */
  private convertRowsToDocuments(rows: CSVRow[]): Document[] {
    return rows.map((row, index) => {
      // Extract URL path for better identification
      let urlPath = '';
      try {
        if (row.url) {
          urlPath = new URL(row.url).pathname;
        }
      } catch (error) {
        urlPath = row.url || '';
      }
      
      // Create structured content for Rayna Tours data
      const content = [
        `Title: ${row.title || 'N/A'}`,
        `Description: ${row.meta_description || 'N/A'}`,
        `URL: ${row.url || 'N/A'}`,
        '',
        'Content:',
        row.content || ''
      ].join('\n');

      // Clean up content - remove excessive whitespace and normalize
      const cleanContent = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();

      return {
        id: `rayna_${index}_${uuidv4()}`,
        content: cleanContent,
        metadata: {
          source: 'rayna_website',
          url: row.url || '',
          title: row.title || '',
          description: row.meta_description || '',
          urlPath: urlPath,
          rowIndex: index,
          scrapedAt: new Date().toISOString(),
        },
      };
    });
  }

  /**
   * Chunk documents into smaller pieces
   */
  private chunkDocuments(documents: Document[]): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];

    for (const doc of documents) {
      const docChunks = this.chunkText(
        doc.content,
        config.rag.chunkSize,
        config.rag.chunkOverlap
      );

      docChunks.forEach((chunkContent, chunkIndex) => {
        chunks.push({
          id: `${doc.id}_chunk_${chunkIndex}`,
          content: chunkContent,
          metadata: {
            ...doc.metadata,
            parentDocumentId: doc.id,
            chunkIndex,
            totalChunks: docChunks.length,
          },
        });
      });
    }

    return chunks;
  }

  /**
   * Split text into chunks with overlap
   */
  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    if (text.length <= chunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;
      
      // Try to find a good breaking point (end of sentence or word)
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('.', end);
        const lastSpace = text.lastIndexOf(' ', end);
        
        if (lastPeriod > start + chunkSize * 0.5) {
          end = lastPeriod + 1;
        } else if (lastSpace > start + chunkSize * 0.5) {
          end = lastSpace;
        }
      }

      chunks.push(text.slice(start, end).trim());
      
      if (end >= text.length) break;
      
      start = end - overlap;
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  /**
   * Generate embeddings for all chunks
   */
  private async generateEmbeddingsForChunks(chunks: DocumentChunk[]): Promise<void> {
    console.log(`[DataIngestion] Generating embeddings for ${chunks.length} chunks...`);

    const batchSize = 10; // Process in batches to avoid rate limits
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map(chunk => chunk.content);

      try {
        const embeddings = await this.embeddingService.generateEmbeddings(texts);
        
        batch.forEach((chunk, index) => {
          chunk.embedding = embeddings[index];
        });

        console.log(`[DataIngestion] Generated embeddings for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[DataIngestion] Failed to generate embeddings for batch starting at index ${i}:`, error);
        throw error;
      }
    }

    console.log('[DataIngestion] Successfully generated all embeddings');
  }

  /**
   * Re-ingest data (clear existing and ingest fresh)
   */
  async reingestFromCSV(csvFilePath?: string): Promise<void> {
    console.log('[DataIngestion] Starting re-ingestion...');
    
    // Clear existing data
    await this.vectorService.clearIndex();
    
    // Ingest fresh data
    await this.ingestFromCSV(csvFilePath);
    
    console.log('[DataIngestion] Re-ingestion completed');
  }
}