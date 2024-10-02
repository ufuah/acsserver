import express from "express";
import {
  getAllSales,
  addSale,
  updateSaleStatus,
  Return,
  Exchange,
  getAllCustomers,
  getCustomerByName,
  getSaleById
} from "../controllers/salesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all sales
router.get("/", getAllSales);

// Add a new sale
router.post("/add", addSale);

// update sale  status
router.put("/:saleId/status", updateSaleStatus);

router.post("/return", Return);
 
router.post('/exchange', Exchange);

// Get all customers
router.get("/customers", getAllCustomers);

// Get customer by name
router.get("/customers/:customer_name", getCustomerByName);

// New route to get sale by ID
router.get("/:saleId", getSaleById); // Add this line

export default router;
