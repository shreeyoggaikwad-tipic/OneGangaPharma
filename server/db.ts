// import dotenv from 'dotenv';
// dotenv.config();

// import mysql from 'mysql2/promise';
// import { drizzle } from 'drizzle-orm/mysql2';
// import * as schema from '@shared/schema';

// const dbUrl = process.env.DATABASE_URL;

// if (!dbUrl) {
//   throw new Error("DATABASE_URL is not defined in .env");
// }

// const url = new URL(dbUrl);

// const connectionConfig = {
//   host: url.hostname,
//   port: parseInt(url.port || '3306'),
//   user: url.username,
//   password: url.password,
//   database: url.pathname.slice(1), // removes the leading slash
//   multipleStatements: true,
// };

// export const connection = mysql.createConnection(connectionConfig);
// export const db = drizzle(connection, { schema, mode: 'default' });
import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '@shared/schema';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const url = new URL(dbUrl);

const connectionConfig = {
  host: url.hostname,
  port: parseInt(url.port || '3306'),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  multipleStatements: true,
};

// ✅ Await the connection properly
const connection = await mysql.createConnection(connectionConfig);

export const db = drizzle(connection, { schema, mode: 'default' });
