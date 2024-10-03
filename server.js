import express from "express";
import cors from "cors";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import stocksRoutes from "./routes/stocksRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import authRoutes from "./routes/authRoues.js"
import cookieParser from 'cookie-parser'
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cookieParser());
app.use(express.json());


// Middleware
app.use(
  cors({
    origin: [
      "https://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.1.139:5173",
      "http://192.168.240.94:5173",
      "http://192.168.43.194:3000",
      "https://192.168.43.194:3000",
      "https://admin.e-palateoasis.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


// Routes
app.use("/api/categories", categoriesRoutes);
app.use("/api/stocks", stocksRoutes);
app.use("/api/transations", salesRoutes);
app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
