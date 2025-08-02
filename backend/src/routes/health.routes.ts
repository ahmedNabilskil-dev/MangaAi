import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MangaAI Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

router.get("/status", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
