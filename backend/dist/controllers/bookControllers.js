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
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBooks = exports.getBookByISBN = exports.addBook = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const bookSchema = zod_1.z.object({
    isbn: zod_1.z.string().min(10, "ISBN must be at least 10 characters long"),
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string(),
    copies: zod_1.z.number().int().min(1, "Copies must be at least 1"),
});
const addBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { isbn, title, description, copies } = bookSchema.parse(req.body);
        const existingBook = yield prisma.book.findUnique({ where: { isbn } });
        if (existingBook) {
            res.status(400).json({ error: "Book with this ISBN already exists" });
            return;
        }
        const book = yield prisma.book.create({
            data: { isbn, title, description, copies },
        });
        res.status(201).json({ message: "Book added successfully", book });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors });
        }
        else {
            res.status(500).json({ error: "Server error" });
        }
    }
});
exports.addBook = addBook;
const getBookByISBN = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isbn } = req.params;
    try {
        const book = yield prisma.book.findUnique({ where: { isbn } });
        if (!book) {
            res.status(404).json({ error: "Book not found" });
            return;
        }
        res.status(200).json(book);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getBookByISBN = getBookByISBN;
const searchBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, author, availability } = req.query;
    try {
        const books = yield prisma.book.findMany({
            where: {
                AND: [
                    category
                        ? { categories: { some: { name: category } } }
                        : {},
                    author ? { authors: { some: { name: author } } } : {},
                    availability ? { copies: { gt: 0 } } : {},
                ],
            },
        });
        res.status(200).json(books);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.searchBooks = searchBooks;
