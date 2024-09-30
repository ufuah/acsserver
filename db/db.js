// import mysql from "mysql";

// const connection = mysql.createConnection({
//   host: "p4w8cckgwscok0c0coccowsk",
//   user: "mysql",
//   password: "nK0BEMPe7UBe6auXbR7ycPqS4X0c46sPMlIGAcVB2mmAc99gXZ3UqfG23V20ai21",
//   database: "aceglobal",
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected to MySQL database");
// });

// export default connection;


// import mysql from "mysql";
// import dotenv from "dotenv";

// // Load environment variables from .env file
// dotenv.config();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: 5432,
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected to MySQL database");
// });

// export default connection;



import mysql from "mysql2";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Use environment variables for MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,  // Default to 3306 if not specified
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

export default connection;

