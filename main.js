require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

// Load APIs
const apis = JSON.parse(fs.readFileSync("apis.json"));

// Helper function for Mimsms using Puppeteer
async function callMimsms(phone) {
  const url = `https://billing.mimsms.com/index.php?m=smsmanager&action=request&request_type=call&guest=1&phonenumber=+880${phone}&country=bd&countrycode=880&icphone=+880${phone}`;
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    // Wait a bit to ensure the request is sent
    await page.waitForTimeout(2000);
    await browser.close();
    return "sent";
  } catch (err) {
    if (browser) await browser.close();
    return { error: err.message };
  }
}

// POST route (bot use)
app.post("/call-api", async (req, res) => {
  const { params } = req.body;
  const total = parseInt(params.count) || 1;
  let results = [];

  for (const [apiName, apiConfig] of Object.entries(apis)) {
    for (let i = 0; i < total; i++) {
      try {
        if (apiName.includes("MIMSMS")) {
          const data = await callMimsms(params.phone);
          results.push({ api: apiName, data });
        } else if (apiConfig.method === "GET") {
          const apiUrl = apiConfig.url.replace(/\{phone\}/g, params.phone);
          const response = await axios.get(apiUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
          results.push({ api: apiName, data: response.data });
        } else if (apiConfig.method === "POST") {
          const response = await axios.post(
            apiConfig.url,
            { phone: params.phone },
            { headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" } }
          );
          results.push({ api: apiName, data: response.data });
        }
      } catch (err) {
        results.push({ api: apiName, error: err.response?.data || err.message });
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

  for (const [apiName, apiConfig] of Object.entries(apis)) {
    for (let i = 0; i < total; i++) {
      try {
        if (apiName.includes("MIMSMS")) {
          const data = await callMimsms(phone);
          results.push({ api: apiName, data });
        } else if (apiConfig.method === "GET") {
          const apiUrl = apiConfig.url.replace(/\{phone\}/g, phone);
          const response = await axios.get(apiUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
          results.push({ api: apiName, data: response.data });
        } else if (apiConfig.method === "POST") {
          const response = await axios.post(
            apiConfig.url,
            { phone },
            { headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" } }
          );
          results.push({ api: apiName, data: response.data });
        }
      } catch (err) {
        results.push({ api: apiName, error: err.response?.data || err.message });
      }
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
