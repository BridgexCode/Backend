import express, { Request, Response, NextFunction } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import { betterAuthHandler } from "./modules/auth/auth.controller.js";
import cors from "cors"
import { AppError } from "./common/errors/app-error.js";

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,
}));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.all("/api/auth/{*any}", betterAuthHandler);

// Global JSON Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;

