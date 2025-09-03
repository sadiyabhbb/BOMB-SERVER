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
const { params } = req.body;
const total = parseInt(params.count) || 1;
let results = [];

for (const [apiName, apiConfig] of Object.entries(apis)) {
for (let i = 0; i < total; i++) {
try {
let response;

if (apiConfig.method === "GET") {  
      const apiUrl = apiConfig.url.replace(/\{phone\}/g, params.phone);  
      response = await axios.get(apiUrl, {  
        headers: { "User-Agent": "Mozilla/5.0" }  
      });  
    } else if (apiConfig.method === "POST") {  
      response = await axios.post(  
        apiConfig.url,  
        { phone: params.phone },  
        {  
          headers: {  
            "Content-Type": "application/json",  
            "User-Agent": "Mozilla/5.0"  
          }  
        }  
      );  
    }  

    results.push({ api: apiName, data: response.data });  
  } catch (err) {  
    results.push({  
      api: apiName,  
      error: err.response?.data || err.message  
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

for (const [apiName, apiConfig] of Object.entries(apis)) {
for (let i = 0; i < total; i++) {
try {
let response;

if (apiConfig.method === "GET") {  
      const apiUrl = apiConfig.url.replace(/\{phone\}/g, phone);  
      response = await axios.get(apiUrl, {  
        headers: { "User-Agent": "Mozilla/5.0" }  
      });  
    } else if (apiConfig.method === "POST") {  
      response = await axios.post(  
        apiConfig.url,  
        { phone },  
        {  
          headers: {  
            "Content-Type": "application/json",  
            "User-Agent": "Mozilla/5.0"  
          }  
        }  
      );  
    }  

    results.push({ api: apiName, data: response.data });  
  } catch (err) {  
    results.push({  
      api: apiName,  
      error: err.response?.data || err.message  
    });  
  }  
}

}

res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(🚀 Server running on port ${PORT}));
