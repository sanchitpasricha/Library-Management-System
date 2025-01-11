import express from "express";
import {
  getUserDetails,
  trackBorrowedBooksAndFines,
  enableDisableUserAccount,
} from "../controllers/userControllers";

const router = express.Router();

router.get("/:id", getUserDetails);
router.get("/:id/borrowed", trackBorrowedBooksAndFines);
router.patch("/:id/status", enableDisableUserAccount);

export default router;
