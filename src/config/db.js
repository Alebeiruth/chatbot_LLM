import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const sslEnabled = process.env.DB_SSL === "true";

const pool = mysql.createPool({
  host: process.env.MYSQL_DB_HOST,
  user: process.env.MYSQL_DB_USER,
  database: process.env.MYSQL_DB_SCHEMA,
  password: process.env.MYSQL_DB_PASSWORD,
  port: process.env.MYSQL_DB_PORT || 3306,
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
