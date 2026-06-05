import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import cors from "cors"

const app = express();

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
}));

import { betterAuthHandler } from "./modules/auth/auth.controller";


app.use("/api/auth", authRoutes);

app.all("/api/auth/{*any}", betterAuthHandler);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
