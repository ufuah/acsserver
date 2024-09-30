import mysql from 'mysql';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: '123456789',
  database: 'aceglobal'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

export default connection;
