require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

// Load APIs
const apis = JSON.parse(fs.readFileSync("apis.json"));

// POST route (bot use)
app.post("/call-api", async (req, res) => {
  const { apiName, params } = req.body;
  const apiTemplate = apis[apiName];
  if (!apiTemplate) return res.status(400).send("API not found");

  const total = parseInt(params.count) || 1;
  let results = [];

  for (let i = 0; i < total; i++) {
    const apiUrl = apiTemplate.replace("{phone}", params.phone);
    try {
      // Use GET instead of POST for Bikroy API
      const response = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://bikroy.com/"
        }
      });
      results.push(response.data);
    } catch (err) {
      results.push(
        err.response
          ? { status: err.response.status, data: err.response.data }
          : { error: err.message }
      );
    }
  }

  res.json(results);
});

// GET route (browser test)
app.get("/call-api", async (req, res) => {
  const { phone, count } = req.query;
  const apiTemplate = apis["SMS_API"];
  if (!apiTemplate) return res.status(400).send("API not found");

  const total = parseInt(count) || 1;
  let results = [];

  for (let i = 0; i < total; i++) {
    const apiUrl = apiTemplate.replace("{phone}", phone);
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://bikroy.com/"
        }
      });
      results.push(response.data);
    } catch (err) {
      results.push(
        err.response
          ? { status: err.response.status, data: err.response.data }
          : { error: err.message }
      );
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
