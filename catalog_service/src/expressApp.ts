import express from "express";
import catalogRouter from "./api/catalog.routes";

const app = express();
app.use(express.json());

app.use("/", catalogRouter);

export default app;
