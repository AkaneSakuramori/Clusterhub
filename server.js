import express from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";

const app = express();
const PORT = 3000;
const DB = "./data/files.json";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

function loadDB() {
  if (!fs.existsSync(DB)) return {};
  return JSON.parse(fs.readFileSync(DB));
}

function saveDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

app.post("/api/add", (req, res) => {
  const { title, size, cdn } = req.body;
  if (!title || !cdn) return res.status(400).json({ error: "Missing data" });

  const id = uuid().slice(0, 12);
  const db = loadDB();

  db[id] = {
    id,
    title,
    size,
    cdn,
    created: Date.now()
  };

  saveDB(db);
  res.json({ page: `/file.html?id=${id}` });
});

app.get("/api/file/:id", (req, res) => {
  const db = loadDB();
  res.json(db[req.params.id] || null);
});

app.listen(PORT, () => {
  console.log(`ClusterHub running on http://localhost:${PORT}`);
});
