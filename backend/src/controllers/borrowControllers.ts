import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const borrowBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, bookId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.verified) {
      res.status(403).json({ error: "User email not verified" });
      return;
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.copies <= 0) {
      res.status(404).json({ error: "Book not available" });
      return;
    }

    const borrowedBooksCount = await prisma.borrowedBook.count({
      where: { userId, returnDate: null },
    });
    if (borrowedBooksCount >= 3) {
      res
        .status(403)
        .json({ error: "User has reached the borrowing limit (3 books)" });
      return;
    }

    await prisma.borrowedBook.create({
      data: {
        userId,
        bookId,
        borrowDate: new Date(),
      },
    });

    await prisma.book.update({
      where: { id: bookId },
      data: { copies: book.copies - 1 },
    });

    res.status(201).json({ message: "Book borrowed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const returnBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, bookId } = req.body;

  try {
    const borrowedBook = await prisma.borrowedBook.findFirst({
      where: { userId, bookId, returnDate: null },
    });

    if (!borrowedBook) {
      res.status(404).json({ error: "Borrowed book record not found" });
      return;
    }

    const overdueDays = Math.max(
      0,
      Math.floor(
        (new Date().getTime() - new Date(borrowedBook.borrowDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) - 14
    );

    const fineAmount = overdueDays > 0 ? overdueDays : 0;

    await prisma.borrowedBook.update({
      where: { id: borrowedBook.id },
      data: {
        returnDate: new Date(),
        fineAmount,
      },
    });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (book) {
      await prisma.book.update({
        where: { id: bookId },
        data: { copies: book.copies + 1 },
      });
    }

    res.status(200).json({ message: "Book returned successfully", fineAmount });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
