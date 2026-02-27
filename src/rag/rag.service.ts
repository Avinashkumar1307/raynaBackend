 import { config } from '../config';
import { EmbeddingService } from './embedding.service';
import { VectorService } from './vector.service';
import { RAGContext, VectorMatch } from './types';

export class RAGService {
  private embeddingService: EmbeddingService | null = null;
  private vectorService: VectorService | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = config.rag.enabled;
    
    if (this.enabled) {
      this.embeddingService = new EmbeddingService();
      this.vectorService = new VectorService();
    }
  }

  /**
   * Check if RAG is enabled and properly configured
   */
  isEnabled(): boolean {
    return this.enabled && !!config.rag.pineconeApiKey && !!config.llm.openaiApiKey;
  }

  /**
   * Retrieve relevant context for a user query
   */
  async retrieveContext(query: string, topK?: number): Promise<RAGContext | null> {
    if (!this.isEnabled() || !this.embeddingService || !this.vectorService) {
      console.log('[RAGService] RAG is disabled or not properly configured');
      return null;
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Search for similar vectors
      const matches = await this.vectorService.search(queryEmbedding, topK);

      // Filter matches by minimum similarity threshold
      const relevantMatches = matches.filter(match => match.score > 0.7);

      if (relevantMatches.length === 0) {
        console.log('[RAGService] No relevant context found for query');
        return {
          query,
          matches: [],
          totalMatches: 0,
        };
      }

      console.log(`[RAGService] Found ${relevantMatches.length} relevant context chunks`);

      return {
        query,
        matches: relevantMatches,
        totalMatches: matches.length,
      };
    } catch (error) {
      console.error('[RAGService] Failed to retrieve context:', error);
      return null;
    }
  }

  /**
   * Format context for inclusion in LLM prompt
   */
  formatContextForPrompt(context: RAGContext): string {
    if (!context || context.matches.length === 0) {
      return '';
    }

    const contextText = context.matches
      .map((match, index) => {
        return `Context ${index + 1} (Relevance: ${(match.score * 100).toFixed(1)}%):\n${match.content}`;
      })
      .join('\\n\\n');

    return `
RELEVANT KNOWLEDGE BASE CONTEXT:
${contextText}

Please use the above context to help answer the user's question. If the context contains relevant information, incorporate it into your response. If the context doesn't contain relevant information for the user's question, rely on your general knowledge but mention that you don't have specific information about their query in the knowledge base.
`;
  }

  /**
   * Get enhanced system prompt with RAG context
   */
  async getEnhancedSystemPrompt(originalPrompt: string, userQuery: string): Promise<string> {
    if (!this.isEnabled()) {
      return originalPrompt;
    }

    try {
      const context = await this.retrieveContext(userQuery);
      
      if (!context || context.matches.length === 0) {
        return originalPrompt;
      }

      const contextPrompt = this.formatContextForPrompt(context);
      
      return `${originalPrompt}

${contextPrompt}`;
    } catch (error) {
      console.error('[RAGService] Failed to enhance system prompt:', error);
      return originalPrompt;
    }
  }

  /**
   * Get index statistics
   */
  async getStats(): Promise<any> {
    if (!this.isEnabled() || !this.vectorService) {
      return { error: 'RAG is not enabled' };
    }

    try {
      const stats = await this.vectorService.getIndexStats();
      return {
        enabled: true,
        indexName: config.rag.pineconeIndexName,
        ...stats,
      };
    } catch (error) {
      console.error('[RAGService] Failed to get stats:', error);
      return { error: 'Failed to get statistics' };
    }
  }

  /**
   * Test RAG functionality with a sample query
   */
  async testRAG(testQuery: string = "What services do you offer?"): Promise<any> {
    if (!this.isEnabled()) {
      return { 
        enabled: false, 
        error: 'RAG is not enabled or not properly configured',
        configuration: {
          ragEnabled: config.rag.enabled,
          hasPineconeKey: !!config.rag.pineconeApiKey,
          hasOpenAIKey: !!config.llm.openaiApiKey,
        }
      };
    }

    try {
      const context = await this.retrieveContext(testQuery, 3);
      const stats = await this.getStats();

      return {
        enabled: true,
        testQuery,
        context,
        stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[RAGService] RAG test failed:', error);
      return {
        enabled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        testQuery,
      };
    }
  }
}