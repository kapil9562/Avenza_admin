import dotenv from "dotenv";
dotenv.config();

import connectDB from './src/db/db.js';
import express from "express";
import cors from "cors";
import { productRouter } from './src/routes/product.router.js';
import { authRouter } from "./src/routes/auth.router.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send("Hello from Avenza server 👋");
});

app.get("/ping", (req, res) => {
  res.send("Server is awake");
});

app.use('/api', productRouter);
app.use('/api', authRouter);

// Connect DB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!!", err);
  });