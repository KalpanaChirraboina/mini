const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// EJS setup
app.set("view engine", "ejs");
app.set("views", __dirname);

// Body parser for POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB setup
const uri = 'mongodb+srv://ChirraboinaKalpana:Ammulu%4067@cluster0.15lp22v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
console.log("👉 MONGODB_URI:", uri);
const client = new MongoClient(uri);
let poetsCollection;
let poetsCornerCollection;

client.connect()
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    const db = client.db("PoetsDB");
    poetsCollection = db.collection("kavis");
    poetsCornerCollection = db.collection("poets_corner");
  })
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// Serve static files
app.use(express.static(__dirname));

// ✅ HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home_page.html"));
});

// ✅ SEARCH
app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, "search.html"));
});

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

// ✅ INDIVIDUAL POET PAGE
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

// ✅ TRANSLATE BIO
app.post("/poet/:slug/translate", async (req, res) => {
  try {
    const slug = req.params.slug;
    const poet = await poetsCollection.findOne({ slug });
    if (!poet) {
      return res.status(404).send("Poet not found");
    }

    const textToTranslate = poet.biography;
    const response = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: textToTranslate,
        source: "en",
        target: "te",
        format: "text"
      })
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data = await response.json();

    await poetsCollection.updateOne(
      { slug },
      { $set: { "translations.biography": data.translatedText } }
    );

    console.log(`✅ Saved translation for ${slug}: ${data.translatedText}`);
    res.redirect(`/poet/${slug}`);
  } catch (err) {
    console.error("❌ Error translating:", err);
    res.status(500).send("Translation failed");
  }
});

// ✅ TEST CONNECTION
app.get("/test-connection", async (req, res) => {
  try {
    const poets = await poetsCollection.find({}).toArray();
    res.json(poets);
  } catch (err) {
    console.error("❌ Test connection failed:", err);
    res.status(500).send("Connection failed");
  }
});

// ✅ 🆕 POET'S CORNER PAGE — fully safe with fallback newToken
app.get("/poets_corner", async (req, res) => {
  if (!poetsCornerCollection) {
    return res.status(500).send("Database not connected yet");
  }
  try {
    const thoughts = await poetsCornerCollection.find().toArray();
    const newToken = req.query.newToken || "";
    res.render("poets_corner", { thoughts, newToken });
  } catch (err) {
    console.error("❌ Error loading poets_corner:", err);
    res.render("poets_corner", { thoughts: [], newToken: "" });
  }
});

// ✅ 🆕 ADD A THOUGHT WITH DELETE TOKEN
app.post("/add", async (req, res) => {
  if (!poetsCornerCollection) {
    return res.status(500).send("Database not connected yet");
  }
  const { poetName, thought } = req.body;
  if (!thought) return res.redirect("/poets_corner");

  const deleteToken = crypto.randomBytes(8).toString("hex");

  await poetsCornerCollection.insertOne({
    poetName: poetName || "Anonymous",
    thought,
    deleteToken,
    createdAt: new Date(),
  });

  res.redirect(`/poets_corner?newToken=${deleteToken}`);
});

// ✅ 🆕 DELETE A THOUGHT WITH TOKEN CHECK
app.post("/delete/:id", async (req, res) => {
  if (!poetsCornerCollection) {
    return res.status(500).send("Database not connected yet");
  }

  const { enteredToken } = req.body;

  const thought = await poetsCornerCollection.findOne({ _id: new ObjectId(req.params.id) });
  if (!thought) return res.status(404).send("Thought not found");

  if (enteredToken !== thought.deleteToken) {
    return res.status(403).send("Invalid delete code");
  }

  await poetsCornerCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect("/poets_corner");
});

// ✅ SERVER START
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
