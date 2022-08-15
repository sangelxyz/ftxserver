
import mysql from 'mysql'
import stringify from 'csv-stringify'

//connection.query('SELECT id, vendor FROM vendors', (err, rows, fields) => {
    const stringifier = stringify();

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'sangel',
        password: 'faith123',
        database: 'ftxServer'
      })

connection.query('SELECT * FROM candle').stream().pipe(stringifier).pipe(process.stdout);


