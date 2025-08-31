require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

// Load APIs
const apis = JSON.parse(fs.readFileSync("apis.json"));

// Utility function to get headers based on API
function getHeaders(apiName) {
  if (apiName.includes("MIMSMS")) {
    return { "User-Agent": "Mozilla/5.0", "Referer": "https://billing.mimsms.com/" };
  } else {
    return { "User-Agent": "Mozilla/5.0", "Referer": "https://bikroy.com/" };
  }
}

// Utility function to encode phone for MiMSMS
function encodePhoneForMiMSMS(phone) {
  const phonenumber = encodeURIComponent("+880" + phone); // e.g., +8801761838316
  const icphone = encodeURIComponent("+880 " + phone.slice(0, 4) + "-" + phone.slice(4));
  return { phonenumber, icphone };
}

// POST route (bot use)
app.post("/call-api", async (req, res) => {
  const { params } = req.body;
  const phone = params.phone;
  const total = parseInt(params.count) || 1;

  let results = [];

  for (const [apiName, apiTemplate] of Object.entries(apis)) {
    for (let i = 0; i < total; i++) {
      let apiUrl = apiTemplate;

      // Special handling for MiMSMS API
      if (apiName.includes("MIMSMS")) {
        const { phonenumber, icphone } = encodePhoneForMiMSMS(phone);
        apiUrl = apiUrl
          .replace("{phone}", phonenumber)
          .replace("{icphone}", icphone);
      } else {
        apiUrl = apiUrl.replace(/{phone}/g, phone);
      }

      try {
        const response = await axios.get(apiUrl, { headers: getHeaders(apiName) });
        results.push({ api: apiName, data: response.data });
      } catch (err) {
        results.push({
          api: apiName,
          error: err.response ? err.response.data : err.message
        });
      }
    }
  }

  res.json(results);
});

// GET route (browser test)
app.get("/call-api", async (req, res) => {
  const { phone, count } = req.query;
  const total = parseInt(count) || 1;

  let results = [];

  for (const [apiName, apiTemplate] of Object.entries(apis)) {
    for (let i = 0; i < total; i++) {
      let apiUrl = apiTemplate;

      // Special handling for MiMSMS API
      if (apiName.includes("MIMSMS")) {
        const { phonenumber, icphone } = encodePhoneForMiMSMS(phone);
        apiUrl = apiUrl
          .replace("{phone}", phonenumber)
          .replace("{icphone}", icphone);
      } else {
        apiUrl = apiUrl.replace(/{phone}/g, phone);
      }

      try {
        const response = await axios.get(apiUrl, { headers: getHeaders(apiName) });
        results.push({ api: apiName, data: response.data });
      } catch (err) {
        results.push({
          api: apiName,
          error: err.response ? err.response.data : err.message
        });
      }
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
