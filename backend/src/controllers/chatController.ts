import { Router } from "express";
import { handleChatMessage } from "../services/chatService";

const router = Router();

router.post("/message", async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    if (typeof message !== "string" || !message.trim()) return res.status(400).json({ error: "message required" });
    if (message.length > 1000) return res.status(400).json({ error: "message too long" });
    const result = await handleChatMessage({ message, sessionId });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
