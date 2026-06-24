const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const nodemailer = require('nodemailer');
const net = require('net');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true, // Compatibilidad con versiones de motor extendidas
    transports: ['polling', 'websocket'] // IMPORTANTE: Polling primero para asegurar el Handshake en Render
});

const PORT = process.env.PORT || 3000;

// CONFIGURACIÓN DEL CORREO (Recuerda cambiar tus credenciales aquí)
const CONFIG_CORREO = {
    usuario: 'soportetic.07d06@gmail.com',       // Tu correo emisor
    claveApp: 'bshdczqtwzsrheay',      // La contraseña de 16 letras de Google
    destinatario: 'oscar.porras@educacion.gob.ec' // Correo donde quieres recibir las alertas
};

const transportador = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: CONFIG_CORREO.usuario,
        pass: CONFIG_CORREO.claveApp
    }
});

const enlacesNotificados = {};

const ENLACES = [
    { piloto: "589013", amie: "07H01109", ip: "186.46.7.178", nombre: "CENTRO DE EDUCACIÓN INICIAL 15 DE OCTUBRE" },
    { piloto: "21114", amie: "07H01044", ip: "186.46.7.78", nombre: "CENTRO DE EDUCACIÓN INICIAL CRUZ GARCÍA CAJAMARCA" },
    { piloto: "10062", amie: "07H01029", ip: "186.46.0.230", nombre: "UNIDAD EDUCATIVA DRA. AMADA SEGARRA ORELLANA" },
    { piloto: "2353615", amie: "07H01031", ip: "181.196.62.66", nombre: "UNIDAD EDUCATIVA ANTONIO JOSE DE SUCRE" },
    { piloto: "2465522", amie: "07H01155", ip: "186.46.237.106", nombre: "CONSERVATORIO MARÍA DE JESÚS FLORES MENDOZA" },
    { piloto: "751333", amie: "07H01032", ip: "181.196.62.70", nombre: "UNIDAD EDUCATIVA SANTA ROSA" },
    { piloto: "17885", amie: "07H01153", ip: "186.42.171.10", nombre: "ESCUELA DE EDUCACIÓN BÁSICA EMILIANO VALVERDE" },
    { piloto: "2445687", amie: "07H01034", ip: "186.42.215.18", nombre: "UNIDAD EDUCATIVA DAVID DE JESUS TORRES APOLO" },
    { piloto: "431013", amie: "07H01035", ip: "186.42.119.186", nombre: "UNIDAD EDUCATIVA SIMÓN BOLÍVAR" },
    { piloto: "2645543", amie: "07H01036", ip: "190.214.45.190", module: "UNIDAD EDUCATIVA DR ALFREDO PEREZ GUERRERO", nombre: "UNIDAD EDUCATIVA DR ALFREDO PEREZ GUERRERO" },
    { piloto: "22379", amie: "07H01039", ip: "186.42.99.110", nombre: "UNIDAD EDUCATIVA JOSÉ MARÍA OLLAGUE PAREDES" },
    { piloto: "421090", amie: "07H01045", ip: "181.112.190.222", nombre: "UNIDAD EDUCATIVA GAUDENCIO VITE ORTEGA" },
    { piloto: "753913", amie: "07H01046", ip: "181.196.59.198", nombre: "UNIDAD EDUCATIVA MODESTO CHÁVEZ FRANCO" },
    { piloto: "238381", amie: "07H01050", ip: "190.152.4.202", nombre: "UNIDAD EDUCATIVA PATRICIA CHERREZ DE PESANTES" },
    { piloto: "597898", amie: "07H01053", ip: "186.47.76.202", nombre: "UNIDAD EDUCATIVA ALIDA VALAREZO DE SANCHEZ" },
    { piloto: "22166", amie: "07H01054", ip: "190.152.145.226", nombre: "UNIDAD EDUCATIVA JAVIER SOTO" },
    { piloto: "2465524", amie: "07H01058", ip: "186.46.237.98", nombre: "UNIDAD DE EDUCACION ESPECIALIZADA MANUEL BENJAMIN" },
    { piloto: "2645538", amie: "07H01062", ip: "181.211.244.74", nombre: "UNIDAD EDUCATIVA EUGENIO ESPEJO" },
    { piloto: "244966", amie: "07H01068", ip: "190.152.150.90", nombre: "UNIDAD EDUCATIVA ZOILA UGARTE DE LANDIVAR" },
    { piloto: "430740", amie: "07H01070", ip: "181.112.190.210", nombre: "UNIDAD EDUCATIVA JORGE ENRIQUE CHAVEZ CELI" },
    { piloto: "751883", amie: "07H01077", ip: "181.196.59.178", nombre: "UNIDAD EDUCATIVA MANUEL UTRERAS GOMEZ" },
    { piloto: "19727", amie: "07H01079", ip: "186.46.28.198", nombre: "UNIDAD EDUCATIVA JAMBELI" },
    { piloto: "753512", amie: "07H01080", ip: "181.196.60.158", nombre: "UNIDAD EDUCATIVA MARÍA DEL CARMEN GAVILANES TENEZACA" },
    { piloto: "439876", amie: "07H01081", ip: "181.112.190.226", nombre: "UNIDAD EDUCATIVA JACINTO GRANDA PAREDES" },
    { piloto: "754762", amie: "07H01083", ip: "181.196.62.210", nombre: "UNIDAD EDUCATIVA PROVINCIA DE IMBABURA" },
    { piloto: "755348", amie: "07H01091", ip: "181.196.63.78", nombre: "UNIDAD EDUCATIVA GENERAL ALCIDES PESANTES VILLACIS" },
    { piloto: "262487", amie: "07H01094", ip: "186.42.215.198", nombre: "UNIDAD EDUCATIVA LASTENIA PESANTES DE NIETO" },
    { piloto: "10066", amie: "07H01095", ip: "190.152.222.58", nombre: "UNIDAD EDUCATIVA FRANCO EGIDIO ARIAS" },
    { piloto: "757614", amie: "07H01096", ip: "181.196.62.234", nombre: "UNIDAD EDUCATIVA CRNEL. FÉLIX VEGA DÁVILA" },
    { piloto: "706370", amie: "07H01097", ip: "181.211.244.238", nombre: "UNIDAD EDUCATIVA CIUDAD DE SANTA ROSA" },
    { piloto: "755400", amie: "07H01098", ip: "181.196.62.246", nombre: "UNIDAD EDUCATIVA ENRIQUE SUÁREZ PIMENTEL" },
    { piloto: "420391", amie: "07H01099", ip: "181.112.190.142", nombre: "UNIDAD EDUCATIVA PROF. FABIÁN ESPINOZA SÁNCHEZ" },
    { piloto: "431660", amie: "07H01100", ip: "181.112.190.138", nombre: "UNIDAD EDUCATIVA ABDÓN CALDERÓN MUÑOZ" },
    { piloto: "589016", amie: "07H01105", ip: "131.196.12.147", nombre: "UNIDAD EDUCATIVA GUILLERMINA UNDA DE GARCÍA" },
    { piloto: "760864", amie: "07H01106", ip: "181.196.59.186", nombre: "UNIDAD EDUCATIVA DEMETRIO AGUILERA MALTA" },
    { piloto: "558876", amie: "07H01110", ip: "190.11.26.70", nombre: "UNIDAD EDUCATIVA ALEJANDRO AGUILAR LOZANO" },
    { piloto: "2129395", amie: "07H01112", ip: "186.46.94.162", nombre: "UNIDAD EDUCATIVA ROSA AURORA GARCIA" },
    { piloto: "21112", amie: "07H01121", ip: "186.46.7.74", nombre: "UNIDAD EDUCATIVA JULIO LORENZO BETANCOURT CAILLAGUA" },
    { piloto: "2645537", amie: "07H01125", ip: "181.211.244.214", nombre: "UNIDAD EDUCATIVA ORIENTE ECUATORIANO" },
    { piloto: "2074510", amie: "07H01126", ip: "181.113.7.206", nombre: "UNIDAD EDUCATIVA DR. NAPOLEON MERA" },
    { piloto: "54839", amie: "07H01139", ip: "181.196.150.246", nombre: "UNIDAD EDUCATIVA JOSE ANTONIO JARA" },
    { piloto: "2407473", amie: "07H01141", ip: "181.196.147.2", nombre: "UNIDAD EDUCATIVA 13 DE ABRIL" },
    { piloto: "2552736", amie: "07H01147", ip: "181.211.146.154", nombre: "UNIDAD EDUCATIVA CARLOS ZAMBRANO OREJUELA" },
    { piloto: "251577", amie: "07H01151", ip: "190.214.50.10", nombre: "UNIDAD EDUCATIVA DR. MODESTO CHÁVEZ FRANCO" },
    { piloto: "500077", amie: "07H01154", ip: "186.46.128.122", nombre: "UNIDAD EDUCATIVA LCDO. FAUSTO MOLINA MOLINA" },
    { piloto: "2645536", amie: "07H01169", ip: "190.214.13.114", nombre: "UNIDAD EDUCATIVA ROSA DE LUXEMBURGO" },
    { piloto: "433758", amie: "07H01304", ip: "181.112.190.218", nombre: "UNIDAD EDUCATIVA WALTER LAINEZ MARTÍNEZ" }
];

app.use(express.static(path.join(__dirname, 'public')));

function esHorarioAlerta() {
    const ahora = new Date();
    const horaEcuador = (ahora.getUTCHours() - 5 + 24) % 24;
    return horaEcuador >= 7 && horaEcuador < 15;
}

function enviarCorreoAlerta(enlace) {
    const opcionesCorreo = {
        from: CONFIG_CORREO.usuario,
        to: CONFIG_CORREO.destinatario,
        subject: `⚠️ ALERTA: Enlace CAÍDO - AMIE ${enlace.amie}`,
        html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #f3a6a6; padding: 20px; background-color: #fff5f5; border-radius: 8px;">
                <h2 style="color: #dc2626; margin-top: 0;">📡 Enlace fuera de servicio (Offline)</h2>
                <p>Se ha detectado la caída de conectividad en la siguiente institución:</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px 0; font-weight: bold;">AMIE:</td><td>${enlace.amie}</td></tr>
                    <tr><td style="padding: 5px 0; font-weight: bold;">Institución:</td><td>${enlace.nombre}</td></tr>
                    <tr><td style="padding: 5px 0; font-weight: bold;">Piloto:</td><td>${enlace.piloto}</td></tr>
                    <tr><td style="padding: 5px 0; font-weight: bold;">IP Pública:</td><td style="font-family: monospace; color: #0284c7;">${enlace.ip}</td></tr>
                </table>
            </div>
        `
    };

    transportador.sendMail(opcionesCorreo, (error, info) => {
        if (error) console.error("Error enviando correo:", error);
    });
}

function verificarEnlace(enlace) {
    return new Promise((resolve) => {
        const inicio = Date.now();
        const socket = net.createConnection({ host: enlace.ip, port: 80, timeout: 2500 });

        socket.on('connect', () => {
            const ms = Date.now() - inicio;
            socket.end();
            resolve({ alive: true, time: `${ms} ms` });
        });

        socket.on('error', (err) => {
            const ms = Date.now() - inicio;
            if (err.code === 'ECONNREFUSED') {
                resolve({ alive: true, time: `${ms} ms` });
            } else {
                resolve({ alive: false, time: 'N/A' });
            }
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ alive: false, time: 'N/A' });
        });
    });
}

async function monitorearEnlaces() {
    const promesas = ENLACES.map(async (enlace) => {
        const res = await verificarEnlace(enlace);
        
        if (!res.alive) {
            if (esHorarioAlerta() && !enlacesNotificados[enlace.ip]) {
                enviarCorreoAlerta(enlace);
                enlacesNotificados[enlace.ip] = true;
            }
        } else {
            if (enlacesNotificados[enlace.ip]) {
                enlacesNotificados[enlace.ip] = false;
            }
        }

        io.emit('actualizacion-enlace', {
            ip: enlace.ip,
            nombre: enlace.nombre,
            amie: enlace.amie,
            piloto: enlace.piloto,
            estado: res.alive ? 'Online' : 'Offline',
            tiempo: res.time,
            actualizado: new Date().toLocaleTimeString('es-EC', { timeZone: 'America/Guayaquil' })
        });
    });
    await Promise.all(promesas);
}

setInterval(monitorearEnlaces, 15000);

io.on('connection', (socket) => {
    monitorearEnlaces();
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
