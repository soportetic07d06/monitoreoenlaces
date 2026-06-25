const express = require('express');
const path = require('path');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const app = express();
const PORT = process.env.PORT || 3000;

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/cacti-graph', async (req, res) => {
    const { graph_id } = req.query;
    if (!graph_id) return res.status(400).send('Falta graph_id query param.');
    const cactiBaseUrl = 'https://cacti-corp.fastboy.com.ec';

    try {
        await client.post(`${cactiBaseUrl}/index.php`, new URLSearchParams({
            login_username: 'eduinternet',
            login_password: 'Edu1nT3rn3t23',
            action: 'login'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const response = await client.get(`${cactiBaseUrl}/graph_image.php`, {
            params: {
                local_graph_id: graph_id,
                rra_id: 1,
                graph_width: 420,
                graph_height: 160
            },
            responseType: 'arraybuffer'
        });

        res.setHeader('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        console.error(`Error proxy gráfica ${graph_id}:`, error.message);
        res.redirect(`https://placehold.co/400x160/020617/ef4444?text=Cacti+Timeout+ID+${graph_id}`);
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`=== NOC MONITOR PLATFORM RUNNING ONLINE ON PORT ${PORT} ===`);
});
