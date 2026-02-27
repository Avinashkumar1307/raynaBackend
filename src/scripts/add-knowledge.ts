#!/usr/bin/env ts-node

import "../config"; // Load environment variables
import { DataIngestionService } from "../rag/data-ingestion.service";
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0];

async function addTextFile(filePath: string) {
  const dataIngestionService = new DataIngestionService();
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`📖 Adding text file to knowledge base: ${filePath}`);

  // Read the text file
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Create a temporary CSV-like structure
  const tempCsvContent = `url,title,meta_description,content
https://www.raynatours.com/info,"Rayna Tours Information","Additional information about Rayna Tours services and policies","${content.replace(/"/g, '""')}"`;

  // Create temporary CSV file
  const tempCsvPath = 'data/temp-knowledge.csv';
  fs.writeFileSync(tempCsvPath, tempCsvContent);

  try {
    // Ingest the temporary CSV
    await dataIngestionService.ingestFromCSV(tempCsvPath);
    console.log("✅ Successfully added text file to knowledge base!");
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempCsvPath)) {
      fs.unlinkSync(tempCsvPath);
    }
  }
}

async function main() {
  const dataIngestionService = new DataIngestionService();

  try {
    switch (command) {
      case "text":
        const textFile = args[1];
        if (!textFile) {
          console.error("❌ Please provide a text file path");
          console.log("Usage: npm run add-knowledge text path/to/file.txt");
          process.exit(1);
        }
        await addTextFile(textFile);
        break;

      case "csv":
        const csvFile = args[1];
        if (!csvFile) {
          console.error("❌ Please provide a CSV file path");
          console.log("Usage: npm run add-knowledge csv path/to/file.csv");
          process.exit(1);
        }
        console.log(`📊 Adding CSV file to knowledge base: ${csvFile}`);
        await dataIngestionService.ingestFromCSV(csvFile);
        console.log("✅ Successfully added CSV file to knowledge base!");
        break;

      case "help":
      default:
        console.log(`
📚 Add Knowledge Tool - Rayna Tours RAG System

Usage: npm run add-knowledge <command> [file]

Commands:
  text <file.txt>    - Add a text file to the knowledge base
  csv <file.csv>     - Add a CSV file to the knowledge base  
  help              - Show this help message

Examples:
  npm run add-knowledge text data/booking-info.txt
  npm run add-knowledge csv data/new-tours.csv

Note: This adds to existing knowledge base without clearing existing data.
        `);
        break;
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();