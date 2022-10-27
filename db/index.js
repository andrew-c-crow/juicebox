const { Client } = require('pg'); // imports the pg module

const client = new Client('postgres://localhost:5432/juicebox-dev');


async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active
    FROM users;`
  );
  // console.log(rows)
  return rows;
}

//this function uses destructuring for the rows const (similar to object.rows)
async function createUser({ username, password, name, location }) {
  try {
    const { rows } = await client.query(`
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, password, name, location]);
    console.log(rows)
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }

    try {
      const result = await client.query(`
        UPDATE users
        SET "name"='new name', "location"='new location'
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return result;
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


// async function createUser({ username, password }) {
//   try {
//     const result = await client.query(
//       `INSERT INTO users(username, password) VALUES ($1, $2)
//       ON CONFLICT (username) DO NOTHING RETURNING *;
//       `, [ username, password ]);
//       const rows = result.rows
//       console.log(rows)
//       return rows
//     } catch (error) {
//       throw error;
//     }
//   }