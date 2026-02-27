import dotenv from "dotenv";
dotenv.config();

import connectDB from './src/db/db.js';
import express from "express";
import cors from "cors";
import { productRouter } from './src/routes/product.router.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send("Hello from Avenza server 👋");
});

app.get("/ping", (req, res) => {
  res.send("Server is awake");
});

app.use('/api', productRouter);

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