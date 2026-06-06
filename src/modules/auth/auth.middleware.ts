import { Request, Response, NextFunction } from "express";
import { getAuth } from "../../lib/auth";

const dynamicImport = new Function('specifier', 'return import(specifier)');

/**
 * Middleware to protect secure routes.
 */
export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = await getAuth();
    const { fromNodeHeaders } = await dynamicImport("better-auth/node");
    
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: "Unauthorized: No active session found." });
      return;
    }

    // Attach user and session to the request object
    (req as any).user = session.user;
    (req as any).session = session.session;
    
    next();
  } catch (error) {
    next(error);
  }
};



// huibiby