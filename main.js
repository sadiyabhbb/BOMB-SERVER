require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

// Load APIs
const apis = JSON.parse(fs.readFileSync("apis.json"));

// Function to send OTP for a single API
async function sendOtp(apiName, apiConfig, phone) {
  try {
    let response;

    if (apiConfig.method === "GET") {
      const apiUrl = apiConfig.url.replace(/\{phone\}/g, phone);
      response = await axios.get(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
    } else if (apiConfig.method === "POST") {
      // QuizGiri type POST
      const apiUrl = apiConfig.url;
      const body = { phone };
      // Optional: bundleId for QuizGiri
      if (apiName.includes("QUIZGIRI")) body.bundleId = "1025";

      response = await axios.post(apiUrl, body, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "QuizgiriApp/2.0 (Linux; Android 12)",
          "Accept": "application/json"
        }
      });
    }

    return { api: apiName, data: response.data };
  } catch (err) {
    return { api: apiName, error: err.response?.data || err.message };
  }
}

// POST route (bot use)
app.post("/call-api", async (req, res) => {
  const { params } = req.body;
  const total = parseInt(params.count) || 1;
  let results = [];

  for (const [apiName, apiConfig] of Object.entries(apis)) {
    for (let i = 0; i < total; i++) {
      const result = await sendOtp(apiName, apiConfig, params.phone);
      results.push(result);
    }
  }

  res.json(results);
});

// GET route (browser test)
app.get("/call-api", async (req, res) => {
  const { phone, count } = req.query;
  const total = parseInt(count) || 1;
  let results = [];

  for (const [apiName, apiConfig] of Object.entries(apis)) {
    for (let i = 0; i < total; i++) {
      const result = await sendOtp(apiName, apiConfig, phone);
      results.push(result);
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
