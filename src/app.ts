import express, { Request, Response, NextFunction } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import { betterAuthHandler } from "./modules/auth/auth.controller.js";
import cors from "cors";
import { AppError } from "./common/errors/app-error.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*"
    // process.env.CLIENT_URL ||
    // "http://localhost:3000",

    // credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.all("/api/auth/{*any}", betterAuthHandler);
app.use("/api/users", userRoutes);

// Global JSON Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (
    err.isOperational ||
    err instanceof AppError ||
    (err.statusCode && typeof err.statusCode === "number")
  ) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
