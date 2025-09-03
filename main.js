require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

// Load APIs
const apis = JSON.parse(fs.readFileSync("apis.json"));

// Common mimis headers & cookies
const mimisHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "x-requested-with": "mark.via.gp",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "cookie": "pys_start_session=true; pys_first_visit=true; pysTrafficSource=google.com; pys_landing_page=https://www.mimsms.com/; last_pysTrafficSource=google.com; last_pys_landing_page=https://www.mimsms.com/; _fbp=fb.1.1756666009286.6200100102; pbid=f259622f9e936e6639e5ad114970552418ffec6a13cfccf021bb4ac91fbee2bc; WHMCSYVUpwx4aSYdQ=209db06fb5e4b5809cfd84ea6024d824; __utma=113560987.1701700097.1756666096.1756666096.1756666096.1; __utmc=113560987; __utmz=113560987.1756666096.1.1.utmcsr=mimsms.com|utmccn=(referral)|utmcmd=referral|utmcct=/; TawkConnectionTime=0; twk_uuid_58ebb585f7bbaa72709c57d8=%7B%22uuid%22%3A%221.1hHcKnnxwgrcTbrl1sGBU8TcECZ2o9Nrufz9VSRzAnjuNDKfhtL15RFoDtaqnupGeB9NE56QJrsaON8tJ8VcmlG5S6jNwT2xh9RPbQRU5z9r0ZrXt1u%22%2C%22version%22%3A3%2C%22domain%22%3A%22mimsms.com%22%2C%22ts%22%3A1756668454782%7D"
};

// POST route (bot use)
app.post("/call-api", async (req, res) => {
  const { params } = req.body;
  const total = parseInt(params.count) || 1;
  let results = [];

  for (const [apiName, apiConfig] of Object.entries(apis)) {
    for (let i = 0; i < total; i++) {
      try {
        let response;

        if (apiName.includes("MIMSMS")) {
          const apiUrl = apiConfig.url.replace(/\{phone\}/g, params.phone);
          response = await axios.get(apiUrl, { headers: mimisHeaders });
        } else if (apiConfig.method === "GET") {
          const apiUrl = apiConfig.url.replace(/\{phone\}/g, params.phone);
          response = await axios.get(apiUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        } else if (apiConfig.method === "POST") {
          response = await axios.post(
            apiConfig.url,
            { phone: params.phone },
            { headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" } }
          );
        }

        results.push({ api: apiName, data: response.data });
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
        let response;

        if (apiName.includes("MIMSMS")) {
          const apiUrl = apiConfig.url.replace(/\{phone\}/g, phone);
          response = await axios.get(apiUrl, { headers: mimisHeaders });
        } else if (apiConfig.method === "GET") {
          const apiUrl = apiConfig.url.replace(/\{phone\}/g, phone);
          response = await axios.get(apiUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        } else if (apiConfig.method === "POST") {
          response = await axios.post(
            apiConfig.url,
            { phone },
            { headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" } }
          );
        }

        results.push({ api: apiName, data: response.data });
      } catch (err) {
        results.push({ api: apiName, error: err.response?.data || err.message });
      }
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
