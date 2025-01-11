import express from "express";
import {
  addBook,
  getBookByISBN,
  searchBooks,
} from "../controllers/bookControllers";

const router = express.Router();

router.post("/add", addBook);
router.get("/search", searchBooks);
router.get("/:isbn", getBookByISBN);

export default router;
