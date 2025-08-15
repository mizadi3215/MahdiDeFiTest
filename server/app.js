const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const router = require("./routes");

const app = express();

// config
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "backend/config/config.env" });
}
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(router);
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
  });


  const { readTokenMeta } = require('./Mahdi/contract');


  // Mahdi's API
  app.get('/MehdiApiTest', async (req, res) => {
    try {
      const addr = (req.query.address || '').trim() || undefined; 
      const result = await readTokenMeta(addr);

      console.log('--- MehdiApiTest ---');
      console.log(JSON.stringify(result, null, 2));
      res.json({ ok: true, ...result });
    } catch (e) {
      console.error('[MehdiApiTest] ERROR:', e);
      res.status(500).json({ ok: false, error: e.message || String(e) });
    }
  });


}

module.exports = app;
