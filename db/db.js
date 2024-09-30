import mysql from "mysql";

const connection = mysql.createConnection({
  host: "p4w8cckgwscok0c0coccowsk",
  user: "mysql",
  password: "nK0BEMPe7UBe6auXbR7ycPqS4X0c46sPMlIGAcVB2mmAc99gXZ3UqfG23V20ai21",
  database: "aceglobal",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

export default connection;
