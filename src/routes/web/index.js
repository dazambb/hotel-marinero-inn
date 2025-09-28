const router = require('express').Router()
const web = require('../../controllers/index.js')

router.get('/', web.index)  
router.get('/index', web.index)  

module.exports.router = router
