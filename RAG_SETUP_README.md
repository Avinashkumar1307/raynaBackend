# 🤖 RAG (Retrieval-Augmented Generation) Setup Guide

## 📋 Overview

This guide will help you set up and configure the RAG system for the Rayna Tours Chatbot. RAG enhances the chatbot's responses by providing relevant context from your knowledge base.

## 🛠️ Required Dependencies

All dependencies have been installed. The RAG system uses:

- **@pinecone-database/pinecone** - Vector database
- **openai** - For embeddings (text-embedding-ada-002)
- **csv-parser** - To process your CSV data
- **groq-sdk** - Fast LLM inference (optional)

## 🔧 Environment Variables Setup

Add these variables to your `.env` file:

```env
# =====================================
# RAG Configuration
# =====================================

# Enable/Disable RAG system
RAG_ENABLED=true

# Pinecone Configuration
PINECONE_API_KEY=pcsk_59oZZ2_5dMg8gMrMygoJWHo6kFshvRWeVV8mFDwpiKtk4U9zTusYpp677jv2cLcN17WzNF
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=rayna-knowledge

# OpenAI for Embeddings (Required for RAG)
OPENAI_API_KEY=your-openai-api-key-here

# LLM Provider Selection (choose one)
LLM_PROVIDER=claude  # Options: claude, openai, groq, grok

# LLM API Keys
ANTHROPIC_API_KEY=your-claude-api-key-here
GROQ_API_KEY=your-groq-api-key-here  # Optional, for fast inference
GROK_API_KEY=your-grok-api-key-here  # Optional

# RAG Settings (Optional - defaults provided)
EMBEDDING_MODEL=text-embedding-ada-002
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200
RAG_TOP_K=5
CSV_FILE_PATH=data/knowledge.csv
```

## 📊 What I Need From You

### 1. **Your CSV File Structure**
Please share your web scraped CSV file so I can:
- Understand the column structure
- Customize the data ingestion process
- Optimize how data is chunked and indexed

### 2. **API Keys You Need to Provide**

**Required:**
- **OpenAI API Key** - For generating embeddings (required for RAG)
- **Your preferred LLM API key** (Claude, OpenAI, Groq, or Grok)

**Optional:**
- **Groq API Key** - For faster inference (highly recommended)

### 3. **Pinecone Environment**
What's your Pinecone environment? (I'm currently using 'us-east-1')

## 🚀 Quick Start Guide

### Step 1: Set Environment Variables
```bash
# Copy your Pinecone API key (already provided)
PINECONE_API_KEY=pcsk_59oZZ2_5dMg8gMrMygoJWHo6kFshvRWeVV8mFDwpiKtk4U9zTusYpp677jv2cLcN17WzNF

# Add your OpenAI API key
OPENAI_API_KEY=sk-your-openai-key-here

# Add your preferred LLM API key
ANTHROPIC_API_KEY=your-claude-key-here
```

### Step 2: Place Your CSV File
```bash
mkdir data
# Copy your CSV file to: data/knowledge.csv
```

### Step 3: Start the Server
```bash
npm run start:dev
```

### Step 4: Ingest Your Data
```bash
# POST http://localhost:3001/api/rag/ingest
curl -X POST http://localhost:3001/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{"csvFilePath": "data/knowledge.csv"}'
```

## 🔍 API Endpoints

### RAG Management Endpoints

#### 1. Check RAG Status
```http
GET /api/rag/status
```

#### 2. Test RAG Functionality
```http
POST /api/rag/test
Content-Type: application/json

{
  "query": "What tours do you offer in Dubai?"
}
```

#### 3. Ingest Data from CSV
```http
POST /api/rag/ingest
Content-Type: application/json

{
  "csvFilePath": "data/knowledge.csv",
  "reingest": false  // Set to true to clear existing data first
}
```

#### 4. Search Knowledge Base
```http
POST /api/rag/search
Content-Type: application/json

{
  "query": "Dubai tours",
  "topK": 5
}
```

## 📈 How RAG Works in Your Chatbot

1. **User asks a question** → "What are the best Dubai tours?"

2. **RAG retrieves relevant context** from your knowledge base

3. **Enhanced prompt** is created combining:
   - Original system prompt
   - Retrieved relevant context
   - User question

4. **LLM generates response** using both its training data and your specific knowledge

## 🎯 Multi-LLM Support

Your chatbot now supports multiple LLM providers:

### Available Providers:
- **Claude (Anthropic)** - High quality, reasoning
- **OpenAI (GPT-4)** - Reliable, widely used
- **Groq** - Extremely fast inference
- **Grok (xAI)** - Alternative option

### Switch Between LLMs:
```env
LLM_PROVIDER=claude    # Default, best quality
LLM_PROVIDER=groq      # Fastest responses
LLM_PROVIDER=openai    # GPT-4 power
LLM_PROVIDER=grok      # xAI alternative
```

## 🔧 Customization

### For Your CSV Structure
Once you share your CSV file, I'll customize:

```typescript
// In src/rag/data-ingestion.service.ts
private convertRowsToDocuments(rows: CSVRow[]): Document[] {
  return rows.map((row, index) => {
    // Custom logic based on your CSV columns
    const content = `
      Title: ${row.title}
      Description: ${row.description}
      Price: ${row.price}
      Location: ${row.location}
      Category: ${row.category}
    `;
    
    return {
      id: `doc_${index}_${uuidv4()}`,
      content,
      metadata: {
        source: 'csv',
        title: row.title,
        price: row.price,
        location: row.location,
        // ... other metadata
      },
    };
  });
}
```

## 📝 Next Steps

1. **Share your CSV file** - So I can customize the data processing
2. **Provide API keys** - OpenAI (required) + your preferred LLM
3. **Test the system** - Use the `/api/rag/test` endpoint
4. **Ingest your data** - Use the `/api/rag/ingest` endpoint
5. **Chat with enhanced knowledge** - Try the regular chat with RAG enabled!

## 🚨 Troubleshooting

### Common Issues:

1. **"RAG is disabled"**
   - Check `RAG_ENABLED=true` in .env
   - Ensure `PINECONE_API_KEY` and `OPENAI_API_KEY` are set

2. **"Index not ready"**
   - Pinecone index creation takes 1-2 minutes
   - The system will wait automatically

3. **"No relevant context found"**
   - Your knowledge base might be empty
   - Try ingesting data first with `/api/rag/ingest`

4. **Embedding API errors**
   - Check your OpenAI API key
   - Ensure you have sufficient quota

## 💡 Tips for Best Results

1. **Quality CSV Data**: Clean, well-structured data gives better results
2. **Descriptive Content**: More detailed descriptions = better context matching
3. **Relevant Metadata**: Include categories, prices, locations for better filtering
4. **Regular Updates**: Re-ingest data when you add new tours/information

Let me know when you're ready to proceed with the CSV file and API keys! 🚀