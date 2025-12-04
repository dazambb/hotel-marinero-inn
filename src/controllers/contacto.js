const transporter = require('../config/email');
const { validationResult } = require('express-validator');

const sendAttempts = new Map();

const enviarContacto = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
                message: 'Por favor verifica los datos del formulario'
            });
        }

        const { nombre, email, telefono, mensaje, honeypot } = req.body;

        if (honeypot) {
            console.log('Bot detectado por honeypot');
            return res.status(400).json({
                success: false,
                message: 'Solicitud inválida'
            });
        }

        const clientIP = req.ip || req.connection.remoteAddress;
        
        const now = Date.now();
        const attempts = sendAttempts.get(clientIP) || [];
        const recentAttempts = attempts.filter(time => now - time < 60000); // últimos 60 segundos

        if (recentAttempts.length >= 3) {
            return res.status(429).json({
                success: false,
                message: 'Demasiados intentos. Por favor espera un minuto.'
            });
        }

        recentAttempts.push(now);
        sendAttempts.set(clientIP, recentAttempts);

        if (Math.random() < 0.1) {
            for (const [ip, times] of sendAttempts.entries()) {
                const validTimes = times.filter(time => now - time < 3600000);
                if (validTimes.length === 0) {
                    sendAttempts.delete(ip);
                } else {
                    sendAttempts.set(ip, validTimes);
                }
            }
        }

        const mailOptions = {
            from: `"Hotel Marinero Inn - Contacto" <${process.env.EMAIL_USER || 'noreply@hotelmarineroinn.com'}>`,
            to: process.env.EMAIL_RECEIVER || 'info@hotelmarineroinn.com', // Email donde recibirás los mensajes
            replyTo: email,
            subject: `Nuevo mensaje de contacto - ${nombre}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                        .info-row { margin-bottom: 15px; padding: 10px; background: white; border-left: 4px solid #0d6efd; }
                        .label { font-weight: bold; color: #0d6efd; }
                        .message-box { background: white; padding: 20px; margin-top: 20px; border-radius: 5px; border: 1px solid #dee2e6; }
                        .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🏨 Nuevo Mensaje de Contacto</h2>
                            <p>Hotel Marinero Inn</p>
                        </div>
                        <div class="content">
                            <div class="info-row">
                                <span class="label">👤 Nombre:</span> ${nombre}
                            </div>
                            <div class="info-row">
                                <span class="label">📧 Email:</span> <a href="mailto:${email}">${email}</a>
                            </div>
                            ${telefono ? `
                            <div class="info-row">
                                <span class="label">📱 Teléfono:</span> <a href="tel:${telefono}">${telefono}</a>
                            </div>
                            ` : ''}
                            <div class="message-box">
                                <p class="label">💬 Mensaje:</p>
                                <p>${mensaje.replace(/\n/g, '<br>')}</p>
                            </div>
                            <div class="footer">
                                <p>Recibido el ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}</p>
                                <p>IP: ${clientIP}</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Nuevo mensaje de contacto - Hotel Marinero Inn

Nombre: ${nombre}
Email: ${email}
${telefono ? `Teléfono: ${telefono}` : ''}

Mensaje:
${mensaje}

---
Recibido el ${new Date().toLocaleString('es-EC')}
            `
        };

        const confirmationMail = {
            from: `"Hotel Marinero Inn" <${process.env.EMAIL_USER || 'noreply@hotelmarineroinn.com'}>`,
            to: email,
            subject: 'Hemos recibido tu mensaje - Hotel Marinero Inn',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 12px 30px; background: #ffc107; color: #000; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Gracias por contactarnos!</h1>
                        </div>
                        <div class="content">
                            <p>Hola <strong>${nombre}</strong>,</p>
                            <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.</p>
                            <p><strong>Tu mensaje:</strong></p>
                            <p style="background: white; padding: 15px; border-left: 4px solid #0d6efd;">${mensaje.replace(/\n/g, '<br>')}</p>
                            <center>
                                <a href="https://wa.me/593993161517" class="button">📱 Contáctanos por WhatsApp</a>
                            </center>
                            <p style="margin-top: 30px;">Saludos cordiales,<br><strong>Equipo Hotel Marinero Inn</strong></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        await transporter.sendMail(confirmationMail);

        res.status(200).json({
            success: true,
            message: '¡Mensaje enviado correctamente! Revisa tu email para la confirmación.'
        });

    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({
            success: false,
            message: 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente o contáctanos por WhatsApp.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    enviarContacto
};
