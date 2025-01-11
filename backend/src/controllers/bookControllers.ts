import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const bookSchema = z.object({
  isbn: z.string().min(10, "ISBN must be at least 10 characters long"),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  copies: z.number().int().min(1, "Copies must be at least 1"),
});

export const addBook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if the user is an admin
    const userId = req.body.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== "admin") {
      res
        .status(403)
        .json({ error: "Access denied. Only admins can add books." });
      return;
    }

    const { isbn, title, description, copies, author, category } = req.body;

    let authorRecord = await prisma.author.findUnique({
      where: { name: author },
    });
    if (!authorRecord) {
      authorRecord = await prisma.author.create({ data: { name: author } });
    }

    let categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category },
      });
    }

    const existingBook = await prisma.book.findUnique({ where: { isbn } });
    if (existingBook) {
      res.status(400).json({ error: "Book with this ISBN already exists" });
      return;
    }

    const book = await prisma.book.create({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const searchBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category, author, availability } = req.body;

  console.log(req.body);
  try {
    const books = await prisma.book.findMany({
      where: {
        AND: [
          category
            ? { categories: { some: { name: category as string } } }
            : {},
          author ? { authors: { some: { name: author as string } } } : {},
          availability ? { copies: { gt: 0 } } : {},
        ],
      },
    });

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getBookByISBN = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { isbn } = req.params;

  try {
    const book = await prisma.book.findUnique({ where: { isbn } });
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
