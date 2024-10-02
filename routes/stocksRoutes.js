import express from 'express';
import {
  getAllStocks,
  getStockByDescription,
  saveStock,
  updateStockByDescription,
  addStock,
  updateStock
   // Import the updated function
} from '../controllers/stocksController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get all stock items
router.get('/',authMiddleware, getAllStocks);

// Route to get stock items by description
router.get('/description', getStockByDescription);

// Route to save new stock record
router.post('/add',authMiddleware, addStock);

// Route to update existing stock record by description
router.put('/:description',authMiddleware, updateStock); // Use PUT for updating

export default router;
