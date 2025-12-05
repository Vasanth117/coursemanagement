const database = require('./database');
const jwt = require('./jwt');
const cors = require('./cors');
const multer = require('./multer');
const email = require('./email');

module.exports = {
  database,
  jwt,
  cors,
  multer,
  email
};