const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

module.exports = {
  client,
}