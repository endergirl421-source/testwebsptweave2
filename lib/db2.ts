import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '100.102.160.59',        // หรือ IP ของ Pi
  user: 'pidemo',             // ชื่อ User ของ MySQL
  password: '12345678', // <--- แก้รหัสผ่านตรงนี้ให้ถูกนะครับ!
  database: 'senosr',          // ชื่อ Database ที่เราเพิ่งสร้าง
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;