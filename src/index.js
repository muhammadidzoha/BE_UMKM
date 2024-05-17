import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { resolve } from "path";
import router from "./routes/routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/api", router);
app.use("/static", express.static(resolve("public")));

app.listen(5000, () => {
  console.log("Server Berhasil Berjalan");
});
