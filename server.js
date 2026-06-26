const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

let statusCache = {};
const instituciones = [{"amie": "07H01029", "name": "UE DRA. AMADA SEGARRA ORELLANA", "piloto": "10062", "velocidad": "40MB", "ip": "186.46.0.230", "graph_id": "48051"}, {"amie": "07H01031", "name": "UE ANTONIO JOSE DE SUCRE", "piloto": "2353615", "velocidad": "70MB", "ip": "181.196.62.66", "graph_id": "71235"}, {"amie": "07H01032", "name": "UE SANTA ROSA", "piloto": "751333", "velocidad": "40MB", "ip": "181.196.62.70", "graph_id": "73241"}, {"amie": "07H01044", "name": "CEI CRUZ GARCÍA CAJAMARCA", "piloto": "21114", "velocidad": "40MB", "ip": "186.46.7.78", "graph_id": "67423"}, {"amie": "07H01034", "name": "UE DAVID DE JESUS TORRES APOLO", "piloto": "2445687", "velocidad": "40MB", "ip": "186.42.215.18", "graph_id": "57378"}, {"amie": "07H01035", "name": "UE SIMÓN BOLÍVAR", "piloto": "431013", "velocidad": "50MB", "ip": "186.42.119.186", "graph_id": "59591"}, {"amie": "07H01036", "name": "UE DR ALFREDO PEREZ GUERRERO", "piloto": "2645543", "velocidad": "70MB", "ip": "190.214.45.190", "graph_id": "59895"}, {"amie": "07H01039", "name": "UE JOSÉ MARÍA OLLAGUE PAREDES", "piloto": "22379", "velocidad": "40MB", "ip": "186.42.99.110", "graph_id": "71277"}, {"amie": "07H01045", "name": "UE GAUDENCIO VITE ORTEGA", "piloto": "421090", "velocidad": "40MB", "ip": "181.112.190.22", "graph_id": "48341"}, {"amie": "07H01046", "name": "UE MODESTO CHAVEZ FRANCO", "piloto": "753913", "velocidad": "40MB", "ip": "181.196.59.198", "graph_id": "71242"}, {"amie": "07H01050", "name": "UE PATRICIA CHERREZ DE PESANTES", "piloto": "238381", "velocidad": "40MB", "ip": "190.152.4.202", "graph_id": "61348"}, {"amie": "07H01053", "name": "UE ALIDA VALAREZO DE SANCHEZ", "piloto": "597898", "velocidad": "40MB", "ip": "186.47.76.202", "graph_id": "67409"}, {"amie": "07H01054", "name": "UE JAVIER SOTO", "piloto": "22166", "velocidad": "40MB", "ip": "190.152.145.22", "graph_id": "67416"}, {"amie": "07H01058", "name": "UEE MANUEL BENJAMÍN PESANTES VALAREZO", "piloto": "2465524", "velocidad": "40MB", "ip": "186.46.237.98", "graph_id": "71238"}, {"amie": "07H01062", "name": "UE EUGENIO ESPEJO", "piloto": "2645538", "velocidad": "40MB", "ip": "181.211.244.74", "graph_id": "71247"}, {"amie": "07H01068", "name": "UE ZOILA UGARTE DE LANDIVAR", "piloto": "244966", "velocidad": "80MB", "ip": "190.152.150.90", "graph_id": "71222"}, {"amie": "07H01070", "name": "UE JORGE ENRIQUE CHAVEZ CELI", "piloto": "430740", "velocidad": "70MB", "ip": "181.112.190.21", "graph_id": "20804"}, {"amie": "07H01077", "name": "UE MANUEL UTRERAS GOMEZ", "piloto": "751883", "velocidad": "40MB", "ip": "181.196.59.178", "graph_id": "71248"}, {"amie": "07H01079", "name": "UE JAMBELI", "piloto": "19727", "velocidad": "2F 55X25 MB", "ip": "186.46.28.198", "graph_id": "67411"}, {"amie": "07H01080", "name": "UE MARÍA DEL CARMEN GAVILANES TENEZACA", "piloto": "753512", "velocidad": "40MB", "ip": "181.196.60.158", "graph_id": "48553"}, {"amie": "07H01081", "name": "UE JACINTO GRANDA PAREDES", "piloto": "439876", "velocidad": "50MB", "ip": "181.112.190.22", "graph_id": "48148"}, {"amie": "07H01083", "name": "UE PROVINCIA DE IMABURA", "piloto": "754762", "velocidad": "40MB", "ip": "181.196.62.210", "graph_id": "71226"}, {"amie": "07H01091", "name": "UE GENERAL ALCIDES PESANTES VILLACIS", "piloto": "755348", "velocidad": "40MB", "ip": "181.196.63.78", "graph_id": "71239"}, {"amie": "07H01094", "name": "UE LASTENIA PESANTES DE NIETO", "piloto": "262487", "velocidad": "40MB", "ip": "186.42.215.198", "graph_id": "71243"}, {"amie": "07H01095", "name": "UE FRANCO EGIDIO ARIAS", "piloto": "10066", "velocidad": "40MB", "ip": "190.152.222.58", "graph_id": "67405"}, {"amie": "07H01096", "name": "UE CRNEL. FÉLIX VEGA DÁVILA", "piloto": "757614", "velocidad": "70MB", "ip": "181.196.62.234", "graph_id": "71245"}, {"amie": "07H01097", "name": "UE CIUDAD DE SANTA ROSA", "piloto": "706370", "velocidad": "40MB", "ip": "181.211.244.23", "graph_id": "67406"}, {"amie": "07H01098", "name": "UE PROF. ENRIQUE SUAREZ PIMENTEL", "piloto": "754400", "velocidad": "40MB", "ip": "181.196.62.246", "graph_id": "71237"}, {"amie": "07H01099", "name": "UE PROF. FABIÁN ESPINOZA SÁNCHEZ", "piloto": "420391", "velocidad": "40MB", "ip": "181.112.190.14", "graph_id": "48263"}, {"amie": "07H01100", "name": "UE ABDÓN CALDERÓN MUÑOZ", "piloto": "431660", "velocidad": "50MB", "ip": "181.112.190.13", "graph_id": "59862"}, {"amie": "07H01105", "name": "UE GUILLERMINA UNDA DE GARCIA", "piloto": "589016", "velocidad": "40MB", "ip": "131.196.12.147", "graph_id": "67407"}, {"amie": "07H01106", "name": "UE DEMETRIO AGUILERA MALTA", "piloto": "760864", "velocidad": "2F 55X25 MB", "ip": "181.196.59.186", "graph_id": "48567"}, {"amie": "07H01109", "name": "CEI 15 DE OCTUBRE", "piloto": "589013", "velocidad": "40MB", "ip": "186.46.7.178", "graph_id": "71244"}, {"amie": "07H01110", "name": "UE ALEJANDRO AGUILAR LOZANO", "piloto": "558876", "velocidad": "40MB", "ip": "190.11.26.70", "graph_id": "60840"}, {"amie": "07H01112", "name": "UE ROSA AURORA GARCIA", "piloto": "2129395", "velocidad": "40MB", "ip": "186.46.94.162", "graph_id": "67404"}, {"amie": "07H01121", "name": "UE JULIO LORENZO BETANCOURT CAILLAGUA", "piloto": "21112", "velocidad": "40MB", "ip": "186.46.7.74", "graph_id": "71319"}, {"amie": "07H01125", "name": "UE ORIENTE ECUATORIANO", "piloto": "2645537", "velocidad": "50MB", "ip": "181.211.244.21", "graph_id": "60805"}, {"amie": "07H01126", "name": "UE DR. NAPOLEON MERA", "piloto": "2074510", "velocidad": "40MB", "ip": "181.113.7.206", "graph_id": "56171"}, {"amie": "07H01139", "name": "UE JOSE ANTONIO JARA", "piloto": "54839", "velocidad": "40MB", "ip": "181.196.150.24", "graph_id": "65423"}, {"amie": "07H01141", "name": "UE 13 DE ABRIL", "piloto": "2407473", "velocidad": "40MB", "ip": "181.196.147.2", "graph_id": "65424"}, {"amie": "07H01147", "name": "UE CARLOS ZAMBRANO OREJUELA", "piloto": "2552736", "velocidad": "50MB", "ip": "181.211.244.15", "graph_id": "21596"}, {"amie": "07H01151", "name": "UE DR. MODESTO CHÁVEZ FRANCO", "piloto": "251577", "velocidad": "40MB", "ip": "190.214.50.10", "graph_id": "67559"}, {"amie": "07H01153", "name": "EEB EMILIANO VALVERDE", "piloto": "17885", "velocidad": "40MB", "ip": "186.42.171.10", "graph_id": "57015"}, {"amie": "07H01154", "name": "UE LCDO. FAUSTO MOLINA MOLINA", "piloto": "500077", "velocidad": "40MB", "ip": "186.46.128.122", "graph_id": "61642"}, {"amie": "07H01169", "name": "UE ROSA DE LUXEMBURGO", "piloto": "2645536", "velocidad": "50MB", "ip": "190.214.13.114", "graph_id": "56997"}, {"amie": "07H01304", "name": "UE WALTER LAINEZ MARTÍNEZ", "piloto": "433758", "velocidad": "40MB", "ip": "181.112.190.21", "graph_id": "59592"}, {"amie": "07H01550", "name": "CONSERVATORIO MARÍA DE JESÚS FLORES MENDOZA", "piloto": "2465522", "velocidad": "40MB", "ip": "186.46.237.106", "graph_id": "71236"}];

// Inicialización de la cache de estados
instituciones.forEach(inst => {
    statusCache[inst.amie] = { online: false, latency: 'PENDIENTE...' };
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) => {
    res.json(statusCache);
});

// Lógica de ping multiplataforma optimizada y corregida
function executePing(ip) {
    return new Promise((resolve) => {
        const isWin = process.platform === "win32";
        // Flags corregidos: Windows usa -w (ms) y Linux/Unix usa -W (segundos)
        const cmd = isWin ? `ping -n 1 -w 1200 ${ip}` : `ping -c 1 -W 2 ${ip}`;
        
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                resolve({ online: false, latency: '—' });
            } else {
                let latency = '20 ms';
                try {
                    if (isWin) {
                        const match = stdout.match(/tiempo[=<]([\d.]+)\s*ms/i);
                        if (match) latency = `${match[1]} ms`;
                    } else {
                        const match = stdout.match(/time=([\d.]+)\s*ms/i);
                        if (match) latency = `${Math.round(parseFloat(match[1]))} ms`;
                    }
                    resolve({ online: true, latency });
                } catch (e) {
                    resolve({ online: true, latency: 'OK' });
                }
            }
        });
    });
}

// Auditoría simultánea controlada de la red distribuida
async function runNetworkPingAudit() {
    console.log("[NOC AUDIT] Iniciando escaneo de conectividad activa sobre los 47 nodos...");
    const auditPromises = instituciones.map(async (inst) => {
        const result = await executePing(inst.ip);
        statusCache[inst.amie] = result;
    });
    await Promise.all(auditPromises);
    console.log("[NOC AUDIT] Auditoría masiva de red procesada con éxito.");
}

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
    console.log(`================================================================`);
    console.log(` CENTRO DE OPERACIONES DE RED - 07D06 MINEDEC ACTIVO `);
    console.log(` Dirección local: http://localhost:${PORT} `);
    console.log(`================================================================`);
    
    // Escaneo inicial inmediato
    runNetworkPingAudit();
    
    // Escaneo periódico continuo cada 25 segundos
    setInterval(runNetworkPingAudit, 25000);
});
