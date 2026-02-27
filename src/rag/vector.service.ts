import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../config';
import { DocumentChunk, VectorMatch } from './types';

export class VectorService {
  private pinecone: Pinecone;
  private indexName: string;

  constructor() {
    if (!config.rag.pineconeApiKey) {
      throw new Error('Pinecone API key is required');
    }

    this.pinecone = new Pinecone({
      apiKey: config.rag.pineconeApiKey,
    });
    
    this.indexName = config.rag.pineconeIndexName;
  }

  /**
   * Initialize Pinecone index (create if doesn't exist)
   */
  async initializeIndex(dimension: number = 1536): Promise<void> {
    try {
      // Check if index exists
      const existingIndexes = await this.pinecone.listIndexes();
      const indexExists = existingIndexes.indexes?.some(index => index.name === this.indexName);

      if (!indexExists) {
        console.log(`[VectorService] Creating Pinecone index: ${this.indexName} with dimension ${dimension}`);
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });

        // Wait for index to be ready
        await this.waitForIndexReady();
        console.log(`[VectorService] Index ${this.indexName} created successfully`);
      } else {
        // Check if existing index has correct dimension
        const indexStats = await this.pinecone.describeIndex(this.indexName);
        const existingDimension = indexStats.dimension;
        
        if (existingDimension !== dimension) {
          console.warn(`[VectorService] Index ${this.indexName} exists but has dimension ${existingDimension}, expected ${dimension}`);
          console.warn('[VectorService] You may need to delete the index and recreate it, or use a different index name');
          throw new Error(`Dimension mismatch: index has ${existingDimension}, but embeddings are ${dimension}`);
        }
        
        console.log(`[VectorService] Index ${this.indexName} already exists with correct dimension ${dimension}`);
      }
    } catch (error) {
      console.error('[VectorService] Failed to initialize index:', error);
      throw error;
    }
  }

  /**
   * Wait for index to be ready
   */
  private async waitForIndexReady(): Promise<void> {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const indexInfo = await this.pinecone.describeIndex(this.indexName);
        if (indexInfo.status?.ready) {
          return;
        }
      } catch (error) {
        console.log(`[VectorService] Waiting for index to be ready... (${attempts + 1}/${maxAttempts})`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error(`Index ${this.indexName} is not ready after ${maxAttempts} attempts`);
  }

  /**
   * Upsert document chunks to Pinecone
   */
  async upsertChunks(chunks: DocumentChunk[]): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      
      const vectors = chunks.map(chunk => ({
        id: chunk.id,
        values: chunk.embedding!,
        metadata: {
          content: chunk.content,
          ...chunk.metadata,
        },
      }));

      // Batch upsert (Pinecone limit is 100 vectors per request)
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert({ records: batch });
        console.log(`[VectorService] Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
      }

      console.log(`[VectorService] Successfully upserted ${chunks.length} chunks`);
    } catch (error) {
      console.error('[VectorService] Failed to upsert chunks:', error);
      throw error;
    }
  }

  /**
   * Search for similar vectors
   */
  async search(queryEmbedding: number[], topK: number = config.rag.topK): Promise<VectorMatch[]> {
    try {
      const index = this.pinecone.index(this.indexName);
      
      const searchResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        includeValues: false,
      });

      return searchResponse.matches?.map(match => ({
        id: match.id || '',
        score: match.score || 0,
        metadata: match.metadata || {},
        content: (match.metadata?.content as string) || '',
      })) || [];
    } catch (error) {
      console.error('[VectorService] Failed to search vectors:', error);
      throw error;
    }
  }

  /**
   * Delete all vectors in the index
   */
  async clearIndex(): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      await index.deleteAll();
      console.log(`[VectorService] Cleared all vectors from index: ${this.indexName}`);
    } catch (error) {
      console.error('[VectorService] Failed to clear index:', error);
      throw error;
    }
  }

  /**
   * Get index stats
   */
  async getIndexStats(): Promise<any> {
    try {
      const index = this.pinecone.index(this.indexName);
      const stats = await index.describeIndexStats();
      return stats;
    } catch (error) {
      console.error('[VectorService] Failed to get index stats:', error);
      throw error;
    }
  }
}