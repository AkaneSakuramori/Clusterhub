import express from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";

const app = express();
const PORT = 3000;
const DB = "./data/files.json";
const BASE_URL = "http://202.61.196.127:3000";

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

/* Add file & generate short link */
app.post("/api/add", (req, res) => {
  const { fileId } = req.body;
  if (!fileId) return res.status(400).json({ error: "Missing fileId" });

  const id = uuid().slice(0, 12);
  const db = loadDB();

  db[id] = { id, fileId, created: Date.now() };
  saveDB(db);

  res.json({
    short: `${BASE_URL}/download/${id}`
  });
});

/* Redirect to Drive usercontent URL */
app.get("/download/:id", (req, res) => {
  const db = loadDB();
  const file = db[req.params.id];
  if (!file) return res.status(404).send("Invalid link");

  const driveUrl =
    `https://drive.usercontent.google.com/download?id=${file.fileId}` +
    `&export=download&confirm=t`;

  res.redirect(driveUrl);
});

app.listen(PORT, () => {
  console.log(`ClusterHub running on ${BASE_URL}`);
});
