const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transporter de correo
// IMPORTANTE: Configura estas variables en tu archivo .env
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verificar conexión solo si las credenciales están configuradas
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify(function (error, success) {
        if (error) {
            console.error('❌ Error en configuración de email:', error.message);
        } else {
            console.log('✅ Servidor de email listo para enviar mensajes');
        }
    });
} else {
    console.warn('⚠️ Credenciales de email no configuradas. Crea un archivo .env basado en .env.example');
}

module.exports = transporter;
