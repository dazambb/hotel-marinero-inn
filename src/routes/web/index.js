const router = require('express').Router()
const web = require('../../controllers/index.js')
const contacto = require('../../controllers/contacto.js')
const { body } = require('express-validator')
const rateLimit = require('express-rate-limit')

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    message: { success: false, message: 'Demasiados mensajes enviados. Por favor intenta más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
})

router.get('/', web.index)  
router.get('/index', web.index)

router.post('/contacto', 
    contactLimiter,
    [
        body('nombre')
            .trim()
            .notEmpty().withMessage('El nombre es obligatorio')
            .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
        body('email')
            .trim()
            .notEmpty().withMessage('El email es obligatorio')
            .isEmail().withMessage('Ingresa un email válido')
            .normalizeEmail(),
        body('telefono')
            .optional({ checkFalsy: true })
            .trim()
            .matches(/^[0-9+\-\s()]+$/).withMessage('Ingresa un teléfono válido'),
        body('mensaje')
            .trim()
            .notEmpty().withMessage('El mensaje es obligatorio')
            .isLength({ min: 10, max: 1000 }).withMessage('El mensaje debe tener entre 10 y 1000 caracteres'),
        body('honeypot')
            .isEmpty().withMessage('Campo inválido')
    ],
    contacto.enviarContacto
)

module.exports.router = router
