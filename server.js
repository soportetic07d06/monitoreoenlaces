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
    { piloto: "589013", amie: "07H01109", ip: "186.46.7.178", nombre: "CEI 15 DE OCTUBRE", graphId: "71224" },
    { piloto: "21114", amie: "07H01044", ip: "186.46.7.78", nombre: "CEI CRUZ GARCÍA CAJAMARCA", graphId: "67423" },
    { piloto: "17885", amie: "07H01153", ip: "186.42.171.10", nombre: "EEB EMILIANO VALVERDE", graphId: "57015" },
    { piloto: "2465522", amie: "07H01155", ip: "186.46.237.106", nombre: "CONSERVATORIO MARÍA DE JESÚS FLORES MENDOZA", graphId: "71236" },
    { piloto: "10062", amie: "07H01029", ip: "186.46.0.230", nombre: "UE DRA. AMADA SEGARRA ORELLANA", graphId: "" },
    { piloto: "2353615", amie: "07H01031", ip: "181.196.62.66", nombre: "UE ANTONIO JOSE DE SUCRE", graphId: "" },
    { piloto: "751333", amie: "07H01032", ip: "181.196.62.70", nombre: "UE SANTA ROSA", graphId: "" },
    { piloto: "2445687", amie: "07H01034", ip: "186.42.215.18", nombre: "UE DAVID DE JESUS TORRES APOLO", graphId: "" },
    { piloto: "431013", amie: "07H01035", ip: "186.42.119.186", nombre: "UE SIMÓN BOLÍVAR", graphId: "" },
    { piloto: "2645543", amie: "07H01036", ip: "190.214.45.190", nombre: "UE DR ALFREDO PEREZ GUERRERO", graphId: "" },
    { piloto: "22379", amie: "07H01039", ip: "186.42.99.110", nombre: "UE JOSÉ MARÍA OLLAGUE PAREDES", graphId: "" },
    { piloto: "421090", amie: "07H01045", ip: "181.112.190.222", nombre: "UE GAUDENCIO VITE ORTEGA", graphId: "" },
    { piloto: "753913", amie: "07H01046", ip: "181.196.59.198", nombre: "UE MODESTO CHÁVEZ FRANCO", graphId: "" },
    { piloto: "238381", amie: "07H01050", ip: "190.152.4.202", nombre: "UE PATRICIA CHERREZ DE PESANTES", graphId: "" },
    { piloto: "597898", amie: "07H01053", ip: "186.47.76.202", nombre: "UE ALIDA VALAREZO DE SANCHEZ", graphId: "" },
    { piloto: "22166", amie: "07H01054", ip: "190.152.145.226", nombre: "UE JAVIER SOTO", graphId: "" },
    { piloto: "2465524", amie: "07H01058", ip: "186.46.237.98", nombre: "UEE MANUEL BENJAMIN", graphId: "" },
    { piloto: "2645538", amie: "07H01062", ip: "181.211.244.74", nombre: "UE EUGENIO ESPEJO", graphId: "" },
    { piloto: "244966", amie: "07H01068", ip: "190.152.150.90", nombre: "UE ZOILA UGARTE DE LANDIVAR", graphId: "" },
    { piloto: "430740", amie: "07H01070", ip: "181.112.190.210", nombre: "UE JORGE ENRIQUE CHAVEZ CELI", graphId: "" },
    { piloto: "751883", amie: "07H01077", ip: "181.196.59.178", nombre: "UE MANUEL UTRERAS GOMEZ", graphId: "" },
    { piloto: "19727", amie: "07H01079", ip: "186.46.28.198", nombre: "UE JAMBELI", graphId: "" },
    { piloto: "753512", amie: "07H01080", ip: "181.196.60.158", nombre: "UE MARÍA DEL CARMEN GAVILANES TENEZACA", graphId: "" },
    { piloto: "439876", amie: "07H01081", ip: "181.112.190.226", nombre: "UE JACINTO GRANDA PAREDES", graphId: "" },
    { piloto: "754762", amie: "07H01083", ip: "181.196.62.210", nombre: "UE PROVINCIA DE IMBABURA", graphId: "" },
    { piloto: "755348", amie: "07H01091", ip: "181.196.63.78", nombre: "UE GENERAL ALCIDES PESANTES VILLACIS", graphId: "" },
    { piloto: "262487", amie: "07H01094", ip: "186.42.215.198", nombre: "UE LASTENIA PESANTES DE NIETO", graphId: "" },
    { piloto: "10066", amie: "07H01095", ip: "190.152.222.58", nombre: "UE FRANCO EGIDIO ARIAS", graphId: "" },
    { piloto: "757614", amie: "07H01096", ip: "181.196.62.234", nombre: "UE CRNEL. FÉLIX VEGA DÁVILA", graphId: "" },
    { piloto: "706370", amie: "07H01097", ip: "181.211.244.238", nombre: "UE CIUDAD DE SANTA ROSA", graphId: "" },
    { piloto: "755400", amie: "07H01098", ip: "181.196.62.246", nombre: "UE ENRIQUE SUÁREZ PIMENTEL", graphId: "" },
    { piloto: "420391", amie: "07H01099", ip: "181.112.190.142", nombre: "UE PROF. FABIÁN ESPINOZA SÁNCHEZ", graphId: "" },
    { piloto: "431660", amie: "07H01100", ip: "181.112.190.138", nombre: "UE ABDÓN CALDERÓN MUÑOZ", graphId: "" },
    { piloto: "589016", amie: "07H01105", ip: "131.196.12.147", nombre: "UE GUILLERMINA UNDA DE GARCÍA", graphId: "" },
    { piloto: "760864", amie: "07H01106", ip: "181.196.59.186", nombre: "UE DEMETRIO AGUILERA MALTA", graphId: "" },
    { piloto: "558876", amie: "07H01110", ip: "190.11.26.70", nombre: "UE ALEJANDRO AGUILAR LOZANO", graphId: "" },
    { piloto: "2129395", amie: "07H01112", ip: "186.46.94.162", nombre: "UE ROSA AURORA GARCIA", graphId: "" },
    { piloto: "21112", amie: "07H01121", ip: "186.46.7.74", nombre: "UE JULIO LORENZO BETANCOURT", graphId: "" },
    { piloto: "2645537", amie: "07H01125", ip: "181.211.244.214", nombre: "UE ORIENTE ECUATORIANO", graphId: "" },
    { piloto: "2074510", amie: "07H01126", ip: "181.113.7.206", nombre: "UE DR. NAPOLEON MERA", graphId: "" },
    { piloto: "54839", amie: "07H01139", ip: "181.196.150.246", nombre: "UE JOSE ANTONIO JARA", graphId: "" },
    { piloto: "2407473", amie: "07H01141", ip: "181.196.147.2", nombre: "UE 13 DE ABRIL", graphId: "" },
    { piloto: "2552736", amie: "07H01147", ip: "181.211.146.154", nombre: "UE CARLOS ZAMBRANO OREJUELA", graphId: "" },
    { piloto: "251577", amie: "07H01151", ip: "190.214.50.10", nombre: "UE DR. MODESTO CHÁVEZ FRANCO", graphId: "" },
    { piloto: "500077", amie: "07H01154", ip: "186.46.128.122", nombre: "UE LCDO. FAUSTO MOLINA MOLINA", graphId: "" },
    { piloto: "2645536", amie: "07H01169", ip: "190.214.13.114", nombre: "UE ROSA DE LUXEMBURGO", graphId: "" },
    { piloto: "433758", amie: "07H01304", ip: "181.112.190.218", nombre: "UE WALTER LAINEZ MARTÍNEZ", graphId: "" }
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
                    <tr><td style="padding: 5px 0; font-weight: bold;"></td><td>${enlace.amie}</td></tr>
                    <tr><td style="padding: 5px 0; font-weight: bold;"></td><td>${enlace.nombre}</td></tr>
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
    return new Promise(async (resolve) => {
        const puertosAProbar = [80, 443, 22, 23]; 
        
        for (const puerto of puertosAProbar) {
            const inicioPuerto = Date.now(); // Cronómetro individual por puerto
            const exito = await new Promise((resPuerto) => {
                const socket = net.createConnection({ host: enlace.ip, port: puerto, timeout: 1500 });

                socket.on('connect', () => {
                    socket.end();
                    resPuerto({ ok: true, ms: Date.now() - inicioPuerto });
                });

                socket.on('error', (err) => {
                    if (err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH') {
                        resPuerto({ ok: true, ms: Date.now() - inicioPuerto });
                    } else {
                        resPuerto({ ok: false });
                    }
                });

                socket.on('timeout', () => {
                    socket.destroy();
                    resPuerto({ ok: false });
                });
            });

            if (exito.ok) {
                // Devolvemos la latencia real del puerto que respondió, descartando los timeouts anteriores
                return resolve({ alive: true, time: `${exito.ms} ms` });
            }
        }
        resolve({ alive: false, time: 'N/A' });
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
