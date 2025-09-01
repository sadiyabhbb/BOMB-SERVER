require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

// Load APIs
const apis = JSON.parse(fs.readFileSync("apis.json"));

// Universal function to call API with browser-like headers
async function callApi(apiUrl) {
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://billing.mimsms.com/",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    return response.data;
  } catch (err) {
    return err.response
      ? { status: err.response.status, data: err.response.data }
      : { error: err.message };
  }
}

// POST route (bot use)
app.post("/call-api", async (req, res) => {
  const { phone, count } = req.body;
  if (!phone) return res.status(400).send("Phone number required");

  const total = parseInt(count) || 1;
  let results = [];

  for (let apiName in apis) {
    const apiTemplate = apis[apiName];

    for (let i = 0; i < total; i++) {
      const apiUrl = apiTemplate.replace(/{phone}/g, phone);
      const data = await callApi(apiUrl);
      results.push({ api: apiName, data });
    }
  }

  res.json(results);
});

// GET route (browser test)
app.get("/call-api", async (req, res) => {
  const { phone, count } = req.query;
  if (!phone) return res.status(400).send("Phone number required");

  const total = parseInt(count) || 1;
  let results = [];

  for (let apiName in apis) {
    const apiTemplate = apis[apiName];

    for (let i = 0; i < total; i++) {
      const apiUrl = apiTemplate.replace(/{phone}/g, phone);
      const data = await callApi(apiUrl);
      results.push({ api: apiName, data });
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
