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
async function createUser({ 
  username, 
  password, 
  name, 
  location }) {
  try {
    const { rows: [user] } = await client.query(`
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, password, name, location]);
    // console.log("This is user", user)
    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  console.log("I am fields", fields)
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
    console.log("I am set String", setString)
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
    console.log("I am the key's value", Object.values(fields))
    try {
      const {rows: [user] } = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      console.log("this is our user log",user)
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function getAllPosts() {
    try {
      const { rows } = await client.query(`
      SELECT id, "authorId", title, content, active
      FROM posts;
      `)
      // console.log("!!!!", rows)
      return rows
    } catch (error) {
      throw error;
    }
  }
  
async function createPost({
  authorId,
  title,
  content
}) {
  try {
    const { rows } = await client.query(`
    INSERT INTO posts ("authorId", title, content)
    VALUES($1, $2, $3)
    RETURNING *;
    `, [authorId, title, content]);
    return rows
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${index + 1}`
  ).join(", ");
  if (setString.length === 0) {
    return;
  }
  try {
    const { rows: [posts] } = await client.query(`
    UPDATE posts
    SET ${ setString }
    WHERE id=${id}
    RETURNING *;
    `, Object.values(fields));
    console.log("Updated post data", posts)
    return posts;
  } catch (error) {
    throw error;
  }
}

  
async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=${ userId };
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById (userId) {
  
  try {
    const { rows: [user] } = await client.query(`
    SELECT * FROM users
    WHERE "id"= ${userId}
    `)

    if (!user) {
      return null;
    }
    delete user.password
    user.posts = await getPostsByUser(userId)
    return user

  } catch (error) {
    throw error;
  }

  async function createTags(tagList) {
    if (tagList.length === 0) { 
      return; 
    }
  
    // need something like: $1), ($2), ($3 
    const insertValues = tagList.map(
      (_, index) => `$${index + 1}`).join('), (');
    // then we can use: (${ insertValues }) in our string template
      console.log("index values for tags", insertValues)
    // need something like $1, $2, $3
    const selectValues = tagList.map(
      (_, index) => `$${index + 1}`).join(', ');
    // then we can use (${ selectValues }) in our string template
  
    try {
         await client.query (`
        INSERT INTO tags(name)
        VALUES (${insertValues})
        ON CONFLICT (name) DO NOTHING;
        `, tagList)

        const {rows} = await client.query (`
        SELECT * FROM tags
        WHERE name
        IN (${selectValues})
        `, tagList)

      return rows
      // insert the tags, doing nothing on conflict
      // returning nothing, we'll query after
  
      // select all tags where the name is in our taglist
      // return the rows from the query

    } catch (error) {
      throw error;
    }
  }


}


  //and export them
  module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    getUserById
  }
