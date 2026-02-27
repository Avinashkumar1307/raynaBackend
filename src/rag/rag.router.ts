import express from 'express';
import { RAGService } from './rag.service';
import { DataIngestionService } from './data-ingestion.service';

const router = express.Router();
const ragService = new RAGService();
const dataIngestionService = new DataIngestionService();

/**
 * GET /api/rag/status
 * Get RAG system status and statistics
 */
router.get('/status', async (req, res) => {
  try {
    const stats = await ragService.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[RAG Router] Status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get RAG status',
    });
  }
});

/**
 * POST /api/rag/test
 * Test RAG functionality
 */
router.post('/test', async (req, res) => {
  try {
    const { query } = req.body;
    const testQuery = query || "What services do you offer?";
    
    const result = await ragService.testRAG(testQuery);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[RAG Router] Test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test RAG',
    });
  }
});

/**
 * POST /api/rag/ingest
 * Ingest data from CSV file
 */
router.post('/ingest', async (req, res) => {
  try {
    const { csvFilePath, reingest } = req.body;
    
    console.log(`[RAG Router] Starting ${reingest ? 're-' : ''}ingestion...`);
    
    if (reingest) {
      await dataIngestionService.reingestFromCSV(csvFilePath);
    } else {
      await dataIngestionService.ingestFromCSV(csvFilePath);
    }
    
    const stats = await ragService.getStats();
    
    res.json({
      success: true,
      message: `Data ${reingest ? 're-' : ''}ingestion completed successfully`,
      data: stats,
    });
  } catch (error) {
    console.error('[RAG Router] Ingestion error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to ingest data',
    });
  }
});

/**
 * POST /api/rag/search
 * Search for relevant context
 */
router.post('/search', async (req, res) => {
  try {
    const { query, topK } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }
    
    const context = await ragService.retrieveContext(query, topK);
    
    res.json({
      success: true,
      data: context,
    });
  } catch (error) {
    console.error('[RAG Router] Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search context',
    });
  }
});

export default router;