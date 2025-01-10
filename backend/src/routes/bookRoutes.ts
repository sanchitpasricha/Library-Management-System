import express from "express";
import {
  addBook,
  getBookByISBN,
  searchBooks,
} from "../controllers/bookControllers";

const router = express.Router();

router.post("/add", addBook);
router.get("/:isbn", getBookByISBN);
router.get("/search", searchBooks);

export default router;
