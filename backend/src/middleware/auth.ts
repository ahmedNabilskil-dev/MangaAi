import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { logger } from "../utils/logger";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: { message: "Access token is required" },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (jwtError) {
      logger.warn("Invalid JWT token", { token, error: jwtError });
      res.status(401).json({
        success: false,
        error: { message: "Invalid or expired token" },
        timestamp: new Date().toISOString(),
      });
      return;
    }
  } catch (error) {
    logger.error("Auth middleware error", { error });
    res.status(500).json({
      success: false,
      error: { message: "Authentication failed" },
      timestamp: new Date().toISOString(),
    });
    return;
  }
};

export type { AuthenticatedRequest };
