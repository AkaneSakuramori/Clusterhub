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

/* Add file */
app.post("/api/add", (req, res) => {
  const { title, size, fileId } = req.body;
  if (!title || !fileId) {
    return res.status(400).json({ error: "Missing title or fileId" });
  }

  const id = uuid().slice(0, 12);
  const db = loadDB();

  db[id] = {
    id,
    title,
    size,
    fileId,
    created: Date.now()
  };

  saveDB(db);
  res.json({ page: `/file.html?id=${id}` });
});

/* Get metadata */
app.get("/api/file/:id", (req, res) => {
  const db = loadDB();
  res.json(db[req.params.id] || null);
});

/* 🔥 Generate fresh Google CDN URL every click */
app.get("/download/:id", async (req, res) => {
  const db = loadDB();
  const file = db[req.params.id];
  if (!file) return res.status(404).send("File not found");

  const driveUrl = `https://drive.google.com/uc?id=${file.fileId}&export=download`;

  try {
    const r = await fetch(driveUrl, { redirect: "manual" });
    const cdn = r.headers.get("location");

    if (!cdn) {
      return res.status(500).send("Failed to generate CDN URL");
    }

    res.redirect(cdn);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error contacting Google Drive");
  }
});

app.listen(PORT, () => {
  console.log(`ClusterHub running on http://202.61.196.127:${PORT}`);
});
