require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

// Load APIs
const apis = JSON.parse(fs.readFileSync("apis.json"));

// Function to send request with headers/cookies
async function sendRequest(apiConfig, phone) {
  const apiUrl = apiConfig.url.replace(/\{phone\}/g, phone);

  const headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 12; M2010J19CG Build/SKQ1.211202.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.7258.143 Mobile Safari/537.36",
    "Referer": "https://www.mimsms.com/",
    "X-Requested-With": "mark.via.gp",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    Cookie:
      "pys_start_session=true; pys_first_visit=true; pysTrafficSource=google.com; pys_landing_page=https://www.mimsms.com/; last_pysTrafficSource=google.com; last_pys_landing_page=https://www.mimsms.com/; _fbp=fb.1.1756666009286.6200100102; pbid=f259622f9e936e6639e5ad114970552418ffec6a13cfccf021bb4ac91fbee2bc; WHMCSYVUpwx4aSYdQ=209db06fb5e4b5809cfd84ea6024d824"
  };

  try {
    if (apiConfig.method === "GET") {
      const response = await axios.get(apiUrl, { headers });
      return response.data;
    } else if (apiConfig.method === "POST") {
      const response = await axios.post(apiUrl, { phone }, { headers });
      return response.data;
    }
  } catch (err) {
    return { error: err.response?.data || err.message };
  }
}

// POST route (bot use)
app.post("/call-api", async (req, res) => {
  const { params } = req.body;
  const total = parseInt(params.count) || 1;
  let results = [];

  for (const [apiName, apiConfig] of Object.entries(apis)) {
    for (let i = 0; i < total; i++) {
      const data = await sendRequest(apiConfig, params.phone);
      results.push({ api: apiName, data });
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
      const data = await sendRequest(apiConfig, phone);
      results.push({ api: apiName, data });
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
