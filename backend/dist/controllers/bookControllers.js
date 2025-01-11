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
exports.getBookByISBN = exports.searchBooks = exports.addBook = void 0;
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
        // Check if the user is an admin
        const userId = req.body.userId;
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== "admin") {
            res
                .status(403)
                .json({ error: "Access denied. Only admins can add books." });
            return;
        }
        const { isbn, title, description, copies, author, category } = req.body;
        let authorRecord = yield prisma.author.findUnique({
            where: { name: author },
        });
        if (!authorRecord) {
            authorRecord = yield prisma.author.create({ data: { name: author } });
        }
        let categoryRecord = yield prisma.category.findUnique({
            where: { name: category },
        });
        if (!categoryRecord) {
            categoryRecord = yield prisma.category.create({
                data: { name: category },
            });
        }
        const existingBook = yield prisma.book.findUnique({ where: { isbn } });
        if (existingBook) {
            res.status(400).json({ error: "Book with this ISBN already exists" });
            return;
        }
        const book = yield prisma.book.create({
            data: {
                isbn,
                title,
                description,
                copies,
                authors: { connect: { id: authorRecord.id } },
                categories: { connect: { id: categoryRecord.id } },
            },
        });
        res.status(201).json({ message: "Book added successfully", book });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});
exports.addBook = addBook;
const searchBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, author, availability } = req.body;
    console.log(req.body);
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
