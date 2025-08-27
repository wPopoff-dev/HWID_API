const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HWIDS_FILE = path.join(__dirname, "hwids.json");

function loadHWIDs() {
  if (!fs.existsSync(HWIDS_FILE)) {
    fs.writeFileSync(HWIDS_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(HWIDS_FILE));
}

function saveHWIDs(hwids) {
  fs.writeFileSync(HWIDS_FILE, JSON.stringify(hwids, null, 2));
}

app.get("/hwids", (req, res) => {
  const hwids = loadHWIDs();
  res.json(hwids);
});

app.post("/hwids", (req, res) => {
  const { hwid } = req.body;
  if (!hwid) return res.status(400).json({ error: "HWID argument no gived" });

  const hwids = loadHWIDs();
  if (hwids.includes(hwid)) {
    return res.status(409).json({ error: "HWID already exists" });
  }

  hwids.push(hwid);
  saveHWIDs(hwids);
  res.json({ success: true, hwid });
});

app.delete("/hwids/:hwid", (req, res) => {
  const { hwid } = req.params;
  let hwids = loadHWIDs();

  if (!hwids.includes(hwid)) {
    return res.status(404).json({ error: "HWID not found" });
  }

  hwids = hwids.filter(h => h !== hwid);
  saveHWIDs(hwids);
  res.json({ success: true, hwid });
});

app.post("/auth", (req, res) => {
  const { hwid } = req.body;
  if (!hwid) return res.status(400).json({ error: "No HWID gived" });

  const hwids = loadHWIDs();
  if (hwids.includes(hwid)) {
    return res.json({ success: true, message: "Valid HWID" });
  } else {
    return res.status(401).json({ success: false, message: "No valid HWID" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on the port ${PORT}`);
});
