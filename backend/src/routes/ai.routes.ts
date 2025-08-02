import { Response, Router } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { aiService } from "../services/ai";
import { logger } from "../utils/logger";

const router = Router();

// Generate text using AI
router.post("/text", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { messages, params = {}, tools = [] } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: { message: "Messages array is required" },
        timestamp: new Date().toISOString(),
      });
    }

    const result = await aiService.generateText(
      userId,
      messages,
      params,
      tools
    );

    if (!result.success) {
      return res.status(402).json({
        success: false,
        error: { message: result.error },
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("AI text generation error:", { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: { message: "AI text generation failed" },
      timestamp: new Date().toISOString(),
    });
  }
});

// Generate image using AI
router.post("/image", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      prompt,
      width = 512,
      height = 512,
      quality = "standard",
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: { message: "Prompt is required" },
        timestamp: new Date().toISOString(),
      });
    }

    const result = await aiService.generateImage(
      userId,
      prompt,
      width,
      height,
      quality
    );

    if (!result.success) {
      return res.status(402).json({
        success: false,
        error: { message: result.error },
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("AI image generation error:", { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: { message: "AI image generation failed" },
      timestamp: new Date().toISOString(),
    });
  }
});

// Estimate credits for AI operations
router.post("/estimate", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { operation, params } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        error: { message: "Operation type is required" },
        timestamp: new Date().toISOString(),
      });
    }

    const estimatedCredits = await aiService.estimateCredits(
      operation,
      params || {}
    );

    res.json({
      success: true,
      data: {
        operation,
        estimatedCredits,
        params,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("AI credit estimation error:", {
      error,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      error: { message: "Credit estimation failed" },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
