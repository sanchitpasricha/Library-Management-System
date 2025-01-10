"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma = new client_1.PrismaClient();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail", // Use Gmail; replace with your email service if different
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "Email already exists" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: { name, email, password: hashedPassword, role },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        // console.log(
        //   `Verification link: http://localhost:3000/auth/verify/${token}`
        // );
        const verificationLink = `http://localhost:3000/auth/verify/${token}`;
        yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify Your Email",
            text: `Hi ${name},\n\nPlease verify your email by clicking the link below:\n${verificationLink}\n\nThank you!`,
            html: `<p>Hi ${name},</p><p>Please verify your email by clicking the link below:</p><a href="${verificationLink}">${verificationLink}</a><p>Thank you!</p>`,
        });
        res
            .status(201)
            .json({ message: "User registered. Please verify your email.", user });
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        if (!user.verified) {
            res.status(403).json({ error: "Email not verified" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ message: "Login successful", token });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.login = login;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        yield prisma.user.update({
            where: { id: decoded.id },
            data: { verified: true },
        });
        res.status(200).json({ message: "Email verified successfully" });
    }
    catch (error) {
        res.status(400).json({ error: "Invalid or expired token" });
    }
});
exports.verifyEmail = verifyEmail;
