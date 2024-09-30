import express from 'express';
import { getAllCategories, addCategory } from '../controllers/categoriesController.js';

const router = express.Router();

// Get all categories
router.get('/', getAllCategories);

// Add a new category
router.post('/add', addCategory);

export default router;
