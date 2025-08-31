require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());

// Centralized API URL
const apis = JSON.parse(fs.readFileSync('apis.json'));

/*
Example apis.json:
{
  "SMS_API": "https://bikroy.com/data/phone_number_login/verifications/phone_login?phone={phone}"
}
*/

// POST route (bot use)
app.post('/call-api', async (req, res) => {
    const { apiName, params } = req.body;
    const apiTemplate = apis[apiName];
    if (!apiTemplate) return res.status(400).send('API not found');

    const total = parseInt(params.count) || 1;
    let results = [];

    for (let i = 0; i < total; i++) {
        const apiUrl = apiTemplate.replace('{phone}', params.phone);
        try {
            const response = await axios.post(apiUrl, { phone: params.phone });
            results.push(response.data);
        } catch (err) {
            results.push({ error: err.message });
        }
    }

    res.json(results);
});

// GET route (browser test)
app.get('/call-api', async (req, res) => {
    const { phone, count } = req.query;
    const apiTemplate = apis['SMS_API'];
    if (!apiTemplate) return res.status(400).send('API not found');

    const total = parseInt(count) || 1;
    let results = [];

    for (let i = 0; i < total; i++) {
        const apiUrl = apiTemplate.replace('{phone}', phone);
        try {
            const response = await axios.post(apiUrl, { phone });
            results.push(response.data);
        } catch (err) {
            results.push({ error: err.message });
        }
    }

    res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
