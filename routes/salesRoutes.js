import express from "express";
import {
  getAllSales,
  addSale,
  updateSaleStatus,
  Return,
  Exchange,
  getAllCustomers,
  getCustomerByName,
  getSaleById,
  getAllExchanges,
  getAllReturns
} from "../controllers/salesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all sales
// router.get("/", getAllSales);

router.get('/sales', getAllSales);

router.get('/exchanges', getAllExchanges);

router.get('/returns', getAllReturns);

// Add a new sale
router.post("/sales/add", addSale);

// update sale  status
router.put("/sales/status/:saleId", updateSaleStatus);

router.post("/returns/add", Return);
 
router.post('/exchanges/add', Exchange);

// Get all customers
router.get("/customers", getAllCustomers);

// Get customer by name
router.get("/customers/:customer_name", getCustomerByName);

// New route to get sale by ID
router.get("/:saleId", getSaleById); // Add this line

export default router;
