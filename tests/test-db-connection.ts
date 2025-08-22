import { pool } from 'src/config/db';
import { SELECT_USERS, user, error } from './consts';

async function testDB() {
  try {
    const res = await pool.query(SELECT_USERS);
    console.log(user, res.rows);
  } catch (err) {
    console.error(error, err);
  } finally {
    await pool.end();
  }
}

testDB();
