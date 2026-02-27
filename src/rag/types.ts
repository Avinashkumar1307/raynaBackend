export interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface VectorMatch {
  id: string;
  score: number;
  metadata: Record<string, any>;
  content: string;
}

export interface RAGContext {
  query: string;
  matches: VectorMatch[];
  totalMatches: number;
}

export interface CSVRow {
  [key: string]: string;
}

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateEmbeddings(texts: string[]): Promise<number[][]>;
}