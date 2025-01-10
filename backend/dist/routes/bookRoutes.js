"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookControllers_1 = require("../controllers/bookControllers");
const router = express_1.default.Router();
router.post("/add", bookControllers_1.addBook);
router.get("/:isbn", bookControllers_1.getBookByISBN);
router.get("/search", bookControllers_1.searchBooks);
exports.default = router;
