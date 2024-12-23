import express, { json } from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";
import notificationRoutes from "./routes/notification.js";
import { connectMongoDB } from "./db/connectMongoDB.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

dotenv.config();

// Configuring Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINAR_CLOUD_NAME,
  api_key: process.env.CLOUDINAR_API_KEY,
  api_secret: process.env.CLOUDINAR_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" })); // The limit is 100kb by default, so to upload images we need a higher limit
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

const isProd = process.env.NODE_ENV.trim() === "production";
if (isProd) {
  app.use(express.static(path.resolve(__dirname, "frontend", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log("Server Running on port: ", PORT);
  connectMongoDB().catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
});
