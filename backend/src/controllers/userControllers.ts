import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        borrowedBooks: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const trackBorrowedBooksAndFines = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        borrowedBooks: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const borrowedBooks = user.borrowedBooks.map((borrowedBook) => {
      const overdueDays = Math.max(
        0,
        Math.floor(
          (new Date().getTime() -
            new Date(borrowedBook.returnDate ?? new Date()).getTime()) /
            (1000 * 60 * 60 * 24)
        ) - 14
      );

      return {
        book: borrowedBook.book,
        borrowDate: borrowedBook.borrowDate,
        returnDate: borrowedBook.returnDate,
        fineAmount: overdueDays > 0 ? overdueDays : 0,
      };
    });

    res.status(200).json({ borrowedBooks });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const enableDisableUserAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: { deleted: status },
    });

    res.status(200).json({
      message: `User account ${status ? "disabled" : "enabled"}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
