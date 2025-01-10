const express = require("express");
const router = express.Router();
import { register, login, verifyEmail } from "../controllers/authControllers";

router.post("/register", register);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);

export default router;
