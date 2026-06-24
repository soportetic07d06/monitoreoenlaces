const axios = require('axios');
const net = require('net');

let cactiCookie = '';

// Función para mantener la sesión viva en el Cacti corporativo de CNT
async function autenticarEnCacti() {
    try {
        const params = new URLSearchParams();
        params.append('login_username', 'eduinternet'); // Tu usuario corporativo
        params.append('login_password', 'Edu1nT3rn3t23');    // Coloca la contraseña real aquí
        params.append('action', 'login');

        const response = await axios.post('https://cacti-corp.fastboy.com.ec/index.php', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            maxRedirects: 0, // Evitamos que siga redirecciones para capturar la cookie de sesión limpia
            validateStatus: (status) => status >= 200 && status <= 302
        });

        const cookies = response.headers['set-cookie'];
        if (cookies) {
            cactiCookie = cookies.map(c => c.split(';')[0]).join('; ');
            console.log('Successfully authenticated with Cacti. Session secured.');
        }
    } catch (error) {
        console.error('Error authenticating with Cacti:', error.message);
    }
}

// Función Senior para extraer los Mbps reales sin sobrecargar el ruteador remoto
function obtenerMetricasAnchoBanda(graphId) {
    return new Promise(async (resolve) => {
        if (!graphId || !cactiCookie) {
            return resolve({ down: '0.00 Mbps', up: '0.00 Mbps' });
        }

        try {
            // Consultamos los datos numéricos puros exportados del gráfico RRDtool en formato XML/CSV
            const urlXport = `https://cacti-corp.fastboy.com.ec/graph_xport.php?local_graph_id=${graphId}&graph_start=-300&graph_end=now`;
            const response = await axios.get(urlXport, {
                headers: { 'Cookie': cactiCookie }
            });

            const data = response.data;
            
            // Analizador lógico (Parser) rápido para capturar las últimas líneas de bits transmitidos
            // Cacti exporta los datos en formato de texto ordenado por columnas
            const filas = data.split('\n').filter(line => line.includes('"'));
            if (filas.length > 0) {
                const ultimaLecturaValidada = filas[filas.length - 1].split(',');
                
                // Cacti almacena internamente en Bytes/segundo o bits puros. Convertimos a Mbps estándar:
                const bytesIn = parseFloat(ultimaLecturaValidada[1]) || 0;
                const bytesOut = parseFloat(ultimaLecturaValidada[2]) || 0;

                // Algoritmo de conversión a Megabits por segundo (Mbps) con 2 decimales
                const mbpsDown = ((bytesIn * 8) / 1000000).toFixed(2);
                const mbpsUp = ((bytesOut * 8) / 1000000).toFixed(2);

                return resolve({ down: `${mbpsDown} Mbps`, up: `${mbpsUp} Mbps` });
            }
            
            resolve({ down: '0.00 Mbps', up: '0.00 Mbps' });
        } catch (error) {
            // Si la cookie expiró, intentamos re-autenticar de forma transparente en la siguiente vuelta
            if (error.response && error.response.status === 401) {
                autenticarEnCacti();
            }
            resolve({ down: 'N/A', up: 'N/A' });
        }
    });
}

// Modificamos tu bucle principal de monitoreo para unificar Red + Cacti
async function monitorearEnlaces() {
    for (const enlace of enlaces) {
        // 1. Verificación rápida de latencia real por puertos TCP (Solución anterior)
        const redStatus = await verificarEnlace(enlace); 
        
        // 2. Extracción simultánea del ancho de banda desde Cacti de CNT
        const traficoCacti = await obtenerMetricasAnchoBanda(enlace.graphId);

        // Enviamos el paquete completo de datos unificado por WebSockets hacia tu pantalla web
        io.emit('actualizacion-enlace', {
            amie: enlace.amie,
            alive: redStatus.alive,
            time: redStatus.time,
            down: traficoCacti.down,
            up: traficoCacti.up
        });
    }
}

// Inicialización de seguridad al encender el servidor en Render
autenticarEnCacti();
setInterval(autenticarEnCacti, 1000 * 60 * 30); // Refrescar la sesión web cada 30 minutos automáticamente
