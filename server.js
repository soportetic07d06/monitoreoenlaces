const express = require('express');
const path = require('path');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup persistent HTTP client session jar storage mechanisms for Cacti cookies
const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

// Serve frontend visual application build output files
app.use(express.static(path.join(__dirname, 'public')));

// CACTI IMAGE STREAM SESSIONS PROXY ROUTE ENGINE
app.get('/api/cacti-graph', async (req, res) => {
    const { graph_id } = req.query;
    if (!graph_id) return res.status(400).send('Falta graph_id query param.');
    
    const cactiBaseUrl = 'https://cacti-corp.fastboy.com.ec';

    try {
        // Step 1: Fire automated authentication handshake session setup with user tokens
        await client.post(`${cactiBaseUrl}/index.php`, new URLSearchParams({
            login_username: 'eduinternet',
            login_password: 'Edu1nT3rn3t23',
            action: 'login'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Step 2: Download raw graph image buffer stream leveraging authenticated session context
        const response = await client.get(`${cactiBaseUrl}/graph_image.php`, {
            params: {
                local_graph_id: graph_id,
                rra_id: 1, // Standard daily timeframe monitoring grid layout
                graph_width: 420,
                graph_height: 160
            },
            responseType: 'arraybuffer'
        });

        // Step 3: Stream the image binary data straight to client viewport with valid content types headers
        res.setHeader('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        console.error(`Error de proxy para gráfica ${graph_id}:`, error.message);
        // Fallback placeholder image when session server is down or times out to keep UI unbroken
        res.redirect(`https://placehold.co/400x160/020617/ef4444?text=Cacti+Timeout+ID+${graph_id}`);
    }
});

// Single-page application route wildcard matching fallbacks
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`=== NOC MONITOR PLATFORM RUNNING ONLINE ON PORT ${PORT} ===`);
});
