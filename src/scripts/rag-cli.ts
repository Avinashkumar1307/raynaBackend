#!/usr/bin/env ts-node

import "../config"; // Load environment variables
import { DataIngestionService } from "../rag/data-ingestion.service";
import { RAGService } from "../rag/rag.service";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const dataIngestionService = new DataIngestionService();
  const ragService = new RAGService();

  try {
    switch (command) {
      case "ingest":
        console.log("🔄 Starting data ingestion...");
        const csvPath = args[1] || undefined;
        await dataIngestionService.ingestFromCSV(csvPath);
        console.log("✅ Data ingestion completed successfully!");
        break;

      case "reingest":
        console.log("🔄 Starting data re-ingestion (clearing existing data)...");
        const csvPathReingest = args[1] || undefined;
        await dataIngestionService.reingestFromCSV(csvPathReingest);
        console.log("✅ Data re-ingestion completed successfully!");
        break;

      case "status":
        console.log("📊 RAG System Status:");
        const stats = await ragService.getStats();
        console.log(JSON.stringify(stats, null, 2));
        break;

      case "test":
        console.log("🧪 Testing RAG system...");
        const testQuery = args[1] || "What services do you offer?";
        const testResult = await ragService.testRAG(testQuery);
        console.log("Test Results:");
        console.log(JSON.stringify(testResult, null, 2));
        break;

      case "search":
        console.log("🔍 Searching knowledge base...");
        const query = args[1];
        if (!query) {
          console.error("❌ Please provide a search query");
          process.exit(1);
        }
        const topK = parseInt(args[2]) || 5;
        const context = await ragService.retrieveContext(query, topK);
        console.log("Search Results:");
        console.log(JSON.stringify(context, null, 2));
        break;

      case "help":
      default:
        console.log(`
🤖 RAG CLI Tool - Rayna Tours Chatbot

Usage: npm run rag <command> [arguments]

Commands:
  ingest [csvPath]     - Ingest data from CSV file into vector database
  reingest [csvPath]   - Clear existing data and re-ingest from CSV
  status              - Show RAG system status and statistics
  test [query]        - Test RAG functionality with optional query
  search <query> [k]  - Search knowledge base for relevant context
  help                - Show this help message

Examples:
  npm run rag ingest data/tours.csv
  npm run rag test "What are the best Dubai tours?"
  npm run rag search "luxury tours" 3
  npm run rag status

Environment Variables Required:
  PINECONE_API_KEY - Your Pinecone API key
  OPENAI_API_KEY   - OpenAI API key for embeddings
  RAG_ENABLED      - Set to 'true' to enable RAG
        `);
        break;
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();