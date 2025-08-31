require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());

const apis = JSON.parse(fs.readFileSync('apis.json'));

// POST route (bot use)
app.post('/call-api', async (req, res) => {
    const { apiName, params } = req.body;
    const apiTemplate = apis[apiName];
    if (!apiTemplate) return res.status(400).send('API not found');

    const apiUrl = apiTemplate.replace('{phone}', params.phone || '');

    try {
        const response = await axios.post(apiUrl, params);
        res.json(response.data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// GET route for browser testing: number + count query params
app.get('/call-api', async (req, res) => {
    const { phone, count } = req.query;
    const apiTemplate = apis['SMS_API'];
    if (!apiTemplate) return res.status(400).send('API not found');

    const apiUrl = apiTemplate.replace('{phone}', phone || '');

    try {
        const response = await axios.post(apiUrl, { phone, count });
        res.json(response.data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
