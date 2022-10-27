const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');


async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username
    FROM users;`
  );
  // console.log(rows)
  return rows;
}


async function createUser({ username, password }) {
  try {
    const result = await client.query(
      `INSERT INTO users(username, password) VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING RETURNING *;
      `, [ username, password ]);
      const rows = result.rows
      console.log(rows)
      return rows
    } catch (error) {
      throw error;
    }
  }
  
  //and export them
  module.exports = {
    client,
    getAllUsers,
    createUser
  }


