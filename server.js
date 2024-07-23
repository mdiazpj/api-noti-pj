const express = require('express');
const xmlparser = require('express-xml-bodyparser');
const util = require('util');
const axios = require('axios');
const xml2js = require('xml2js');

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
            // Enviar el XML tal cual se recibe, con todas las cabeceras originales
            const response = await axios.post('https://api.stage.papajohns.cl/v1/middleware/orders/aloha_order?aloha_store_id=324626', req.rawBody, {
                headers: req.headers
            });
            console.log('Notificación enviada:', response.status, response.statusText);

            // Convertir el XML en un objeto JavaScript para mostrarlo en la consola
            xml2js.parseString(req.rawBody, { explicitArray: true }, (err, result) => {
                if (err) {
                    console.error('Error al parsear XML:', err.message);
                } else {
                    console.log('Notificación recibida (XML):', util.inspect(result, { depth: null, colors: true }));
                }
            });

            res.status(200).send('Notificación recibida y reenviada');
        } catch (error) {
            console.error('Error al enviar la notificación:', error.message);
            res.status(500).send('Error al enviar la notificación');
        }
    } else {
        res.status(400).send('Content-Type must be application/xml or text/xml');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
