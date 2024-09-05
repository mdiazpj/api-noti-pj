const express = require('express');
const xmlparser = require('express-xml-bodyparser');
const util = require('util');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3200;

// Middleware para parsear JSON y URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para parsear XML
app.use(xmlparser({ explicitArray: false, normalizeTags: true }));

// Ruta para recibir notificaciones
app.post('/notificaciones', async (req, res) => {
    if (req.headers['content-type'] === 'application/xml' || req.headers['content-type'] === 'text/xml') {
        try {
            // Convertir el XML en un objeto JavaScript para mostrarlo en la consola
            xml2js.parseString(req.rawBody, { explicitArray: true }, (err, result) => {
                if (err) {
                    console.error('Error al parsear XML:', err.message);
                    res.status(500).send('Error al parsear XML');
                } else {
                    console.log('Notificación recibida (XML):', util.inspect(result, { depth: null, colors: true }));

                    // Crear la carpeta logs si no existe
                    const logDir = path.join(__dirname, 'logs');
                    if (!fs.existsSync(logDir)) {
                        fs.mkdirSync(logDir);
                    }

                    // Guardar el XML en un archivo de log
                    const logFile = path.join(logDir, `log-${Date.now()}.xml`);
                    fs.writeFileSync(logFile, req.rawBody, 'utf8');
                    console.log(`Notificación guardada en ${logFile}`);
                    
                    res.status(200).send('Notificación recibida y guardada en el log');
                }
            });
        } catch (error) {
            console.error('Error al procesar la notificación:', error.message);
            res.status(500).send('Error al procesar la notificación');
        }
    } else {
        res.status(400).send('Content-Type must be application/xml or text/xml');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
