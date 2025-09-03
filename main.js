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

      // Mimsms headers browser-like mimic
      const headers =
        apiName === "2. SMS_API_MIMSMS"
          ? {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
              Referer: "https://billing.mimsms.com/",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              Connection: "keep-alive"
              // Cookie: "YOUR_SESSION_COOKIE_HERE"  // optional
            }
          : { "User-Agent": "Mozilla/5.0" };

      response = await axios.get(apiUrl, { headers });
    } else if (apiConfig.method === "POST") {
      response = await axios.post(
        apiConfig.url,
        { phone },
        { headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" } }
      );
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
console.log(`Server running on port ${PORT}`);
app.listen(PORT);
