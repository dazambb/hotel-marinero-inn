const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'marinero',
    multipleStatements: true
})
connection.connect((error) => {
    if (error) {
        console.error('connection failed: ' + error);
        return
    }
    console.log('connection established');
})

module.exports = connection;