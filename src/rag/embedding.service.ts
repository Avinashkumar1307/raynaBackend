import OpenAI from 'openai';
import { config } from '../config';
import { EmbeddingProvider } from './types';

export class EmbeddingService implements EmbeddingProvider {
  private openai: OpenAI;

  constructor() {
    if (!config.llm.openaiApiKey) {
      throw new Error('OpenAI API key is required for embeddings');
    }
    
    this.openai = new OpenAI({
      apiKey: config.llm.openaiApiKey,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: config.rag.embeddingModel,
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('[EmbeddingService] Failed to generate embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: config.rag.embeddingModel,
        input: texts,
        encoding_format: 'float',
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('[EmbeddingService] Failed to generate embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}