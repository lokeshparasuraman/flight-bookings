import { Router } from "express";
import * as authService from "../services/authService";
import { body, validationResult } from "express-validator";

const router = Router();

router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { email, password, name } = req.body;
      const { user, token } = await authService.registerUser(email, password, name);
      res.json({ user, token });
    } catch (e) {
      next(e);
    }
  }
);

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    res.json({ user, token });
  } catch (e) {
    next(e);
  }
});

export default router;
