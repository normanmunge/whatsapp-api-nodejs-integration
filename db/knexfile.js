// Update with your config settings.
const { join } = require('path');
const { checkEnvironment } = require('../utils/utils');
const environment = checkEnvironment();
const PATH = environment === 'production' ? '.env' : '.env.dev';

console.log('THE IDENTIFIED PATH:', PATH);

require('dotenv').config({
  // path: join(__dirname, '..', PATH),
  path: join(__dirname, '..', PATH),
});

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

console.log(
  'THE ENVIRONMENT FOR KNEX DB:',
  environment,
  'AND THE DB NAME IS:',
  process.env.PG_DB,
  'ON HOST'
);
const ssl = {};
const serverSupportSSL =
  environment === 'production' ? (ssl['rejectUnauthorized'] = false) : false;

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      database: process.env.PG_DB,
      user: process.env.PG_ADMIN,
      password: process.env.PG_PASS,
      ssl: serverSupportSSL,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + '/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: __dirname + '/seeds',
    },
    debug: true,
  },

  staging: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      database: process.env.PG_DB,
      user: process.env.PG_ADMIN,
      password: process.env.PG_PASS,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: __dirname + '/seeds',
    },
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      database: process.env.PG_DB,
      user: process.env.PG_ADMIN,
      password: process.env.PG_PASS,
      ssl: serverSupportSSL,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: __dirname + '/seeds',
    },
  },
};
