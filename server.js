require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const body_parser = require('body-parser')
const config = require('./src/config/config')
const router = require('./src/routes/router')
var session = require('express-session')

var MySQLStore = require('connect-mysql')(session)

var options = {
    config: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hotel_marinero',
    },
}
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'cambia-este-secreto-por-uno-seguro',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 día
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
            httpOnly: true,
        },
        store: new MySQLStore(options),
    })
)
app.set('view engine', 'ejs')
app.use(cors(config.cors_options))
app.set('views', path.join(__dirname, 'src/views'))
app.use(body_parser.urlencoded({extended: true}))
app.use(express.json())
app.use(router.router)
app.set('port', config.port)

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'src/public')))
app.use('/public', express.static(path.join(__dirname, 'src/public')))

app.listen(config.port, () => {
    console.log('\n✅ Hotel Marinero Inn - Servidor iniciado')
    console.log(`🌎 Entorno: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🚀 Puerto: ${config.port}`)
    console.log(`🔗 URL: http://localhost:${config.port}`)
    console.log('\nPresiona Ctrl+C para detener el servidor\n')
})

module.exports = app