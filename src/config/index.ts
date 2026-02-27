import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  server: {
    port: parseInt(optional("PORT", "3001")),
    nodeEnv: optional("NODE_ENV", "development"),
    corsOrigin: optional("CORS_ORIGIN", "http://localhost:3000"),
  },

    llm: {
    // Easily switch LLM provider here
    provider: optional("LLM_PROVIDER", "claude") as "claude" | "openai" | "gemini" | "grok" | "groq",
    anthropicApiKey: optional("ANTHROPIC_API_KEY", ""),
    openaiApiKey: optional("OPENAI_API_KEY", ""),
    geminiApiKey: optional("GEMINI_API_KEY", ""),
    grokApiKey: optional("GROK_API_KEY", ""),
    groqApiKey: optional("GROQ_API_KEY", ""),
  },

  rayna: {
    baseUrl: optional("RAYNA_API_BASE_URL", "https://earnest-panda-e8edbd.netlify.app/api"),
  },

  session: {
    // Number of messages sent to Claude as context (keeps cost low)
    maxMessages: parseInt(optional("SESSION_MAX_MESSAGES", "10")),
    // Session TTL in minutes
    ttlMinutes: parseInt(optional("SESSION_TTL_MINUTES", "30")),
  },

    rateLimit: {
    windowMs: parseInt(optional("RATE_LIMIT_WINDOW_MS", "60000")),
    maxRequests: parseInt(optional("RATE_LIMIT_MAX_REQUESTS", "20")),
  },

  // RAG Configuration
  rag: {
    enabled: optional("RAG_ENABLED", "true") === "true",
    pineconeApiKey: optional("PINECONE_API_KEY", ""),
    pineconeEnvironment: optional("PINECONE_ENVIRONMENT", "us-east-1"),
    pineconeIndexName: optional("PINECONE_INDEX_NAME", "raynatour-openai"),
    embeddingModel: optional("EMBEDDING_MODEL", "text-embedding-ada-002"), // OpenAI embedding model
    chunkSize: parseInt(optional("RAG_CHUNK_SIZE", "1000")),
    chunkOverlap: parseInt(optional("RAG_CHUNK_OVERLAP", "200")),
    topK: parseInt(optional("RAG_TOP_K", "5")), // Number of similar chunks to retrieve
    csvFilePath: optional("CSV_FILE_PATH", "data/knowledge.csv"),
  },
} as const;