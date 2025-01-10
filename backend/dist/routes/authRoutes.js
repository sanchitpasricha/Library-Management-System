"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const authControllers_1 = require("../controllers/authControllers");
router.post("/register", authControllers_1.register);
router.post("/login", authControllers_1.login);
router.get("/verify/:token", authControllers_1.verifyEmail);
exports.default = router;
