import { Request, Response, Router } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  calculateTotalCredits,
  getCreditCost,
} from "../services/credit-manager";
import { databaseService } from "../services/database";
import { logger } from "../utils/logger";

const router = Router();

// Get user credit balance and history
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { credits, daily_credits_used } =
      await databaseService.getUserCredits(userId);
    const history = await databaseService.getCreditHistory(userId, 20);

    res.json({
      success: true,
      data: {
        credits,
        daily_credits_used,
        recent_transactions: history,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error fetching credit info:", {
      error,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch credit information" },
      timestamp: new Date().toISOString(),
    });
  }
});

// Deduct credits for operations
router.post("/deduct", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      operation,
      count = 1,
      description,
      // Dynamic parameters
      tokens,
      characters,
      width,
      height,
      quality = "standard",
    } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        error: { message: "Operation type is required" },
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate dynamic cost based on operation parameters
    const params = {
      tokens,
      characters,
      width,
      height,
      quality,
    };

    const creditsNeeded = getCreditCost(operation, params) * count;

    // Deduct credits
    const result = await databaseService.deductCredits(
      userId,
      creditsNeeded,
      operation,
      description || `${operation} operation`,
      {
        operation_count: count,
        credits_per_operation: getCreditCost(operation, params),
        // Include dynamic parameters for audit trail
        ...(tokens && { tokens }),
        ...(characters && { characters }),
        ...(width && { width }),
        ...(height && { height }),
        ...(quality && { quality }),
      }
    );

    if (!result.success) {
      return res.status(402).json({
        success: false,
        error: {
          message: result.error,
          required: creditsNeeded,
          available: result.remainingCredits,
          shortfall: creditsNeeded - result.remainingCredits,
        },
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: {
        creditsDeducted: creditsNeeded,
        remainingCredits: result.remainingCredits,
        operation,
        count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error deducting credits:", { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: { message: "Failed to deduct credits" },
      timestamp: new Date().toISOString(),
    });
  }
});

// Estimate credits for operations
router.post("/estimate", async (req: Request, res: Response) => {
  try {
    const { operations } = req.body;

    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: { message: "Operations array is required" },
        timestamp: new Date().toISOString(),
      });
    }

    const totalCredits = calculateTotalCredits(operations);

    res.json({
      success: true,
      data: {
        totalCredits,
        breakdown: operations.map((op: any) => ({
          type: op.type,
          count: op.count,
          costPerOperation: getCreditCost(op.type, op.params),
          totalCost: getCreditCost(op.type, op.params) * op.count,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error estimating credits:", { error });
    res.status(500).json({
      success: false,
      error: { message: "Failed to estimate credits" },
      timestamp: new Date().toISOString(),
    });
  }
});

// Get credit transaction history
router.get("/history", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await databaseService.getCreditHistory(userId, limit);

    res.json({
      success: true,
      data: {
        transactions: history,
        total: history.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error fetching credit history:", {
      error,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch credit history" },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
