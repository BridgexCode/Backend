import { Request, Response, NextFunction } from "express";
import { getAuth } from "../../lib/auth";

// Bypasses TypeScript's import() -> require() transformation in CommonJS
const dynamicImport = new Function('specifier', 'return import(specifier)');

export const betterAuthHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { toNodeHandler } = await dynamicImport("better-auth/node");
    const auth = await getAuth();

    // Delegate the request to Better Auth's node handler
    const handler = toNodeHandler(auth.handler);
    return handler(req, res);
  } catch (error) {
    next(error);
  }
};
