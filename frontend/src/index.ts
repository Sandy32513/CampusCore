import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);

app.use(express.static(path.join(__dirname, "../public")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(port, () => {
  console.log(`[CampusCore] Frontend App Shell listening on port ${port}`);
});
