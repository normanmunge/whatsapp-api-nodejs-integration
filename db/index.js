const knex = require('knex');
const knexfile = require('./knexfile');
const { checkEnvironment } = require('../utils/utils');

const environment = checkEnvironment();

//TODO: in prod use dependency injection
const db = knex(knexfile[environment]);
module.exports = db;
