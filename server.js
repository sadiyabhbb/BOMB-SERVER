require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());

const apis = JSON.parse(fs.readFileSync('apis.json'));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
