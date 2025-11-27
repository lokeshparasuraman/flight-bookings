import { Router } from "express";
import { handleChatMessage } from "../services/chatService";
const router = Router();

router.post("/message", async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });
    const result = await handleChatMessage({ message, sessionId });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
