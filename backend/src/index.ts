import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/auth", authRouter);
app.use("/books", bookRoutes);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
