// ✅ Load dependencies
require("dotenv").config();
require("dotenv").config();

console.log("MONGODB_URI from .env:", process.env.MONGODB_URI);

const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ✅ EJS & static
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // EJS files in /views
app.use(express.static(__dirname));
// static files

// ✅ MongoDB
const uri = process.env.MONGODB_URI;
console.log("👉 MONGODB_URI:", uri);
const client = new MongoClient(uri);
let poetsCollection;

client.connect()
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    const db = client.db("poetsDB");
    poetsCollection = db.collection("kavis");
  })
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// ✅ Routes

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "search.html"));
});

// Search data
app.get("/search-data", (req, res) => {
  const query = (req.query.q || "").toLowerCase();
  try {
    const data = JSON.parse(fs.readFileSync("data.json", "utf8"));
    const results = data.filter(item =>
      item.name.toLowerCase().includes(query)
    );
    res.json(results);
  } catch (err) {
    console.error("❌ Error reading data.json:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Dynamic poet page
app.get("/poet/:slug", async (req, res) => {
  try {
    if (!poetsCollection) {
      return res.status(500).send("Database not connected yet");
    }

    const poet = await poetsCollection.findOne({ slug: req.params.slug });
    if (!poet) {
      return res.status(404).send("Poet not found");
    }

    res.render("poet", { poet });
  } catch (err) {
    console.error("❌ Error fetching poet:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Optional test connection
app.get("/test-connection", async (req, res) => {
  try {
    const poets = await poetsCollection.find({}).toArray();
    res.json(poets);
  } catch (err) {
    console.error("❌ Test connection failed:", err);
    res.status(500).send("Connection failed");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
