const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = "project";

const client = new MongoClient(url);


async function run(callback) {
  await client.connect()
  const database = client.db(dbName);
  callback && callback(database);
}

module.exports = {
  run  
}