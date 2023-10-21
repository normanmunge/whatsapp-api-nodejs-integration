// Update with your config settings.
const { join } = require('path');
require('dotenv').config({ path: join(__dirname, '..', '.env') });

console.log('THE DB SELECTED IS:', process.env.PG_DB);
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      database: process.env.PG_DB,
      user: process.env.PG_ADMIN,
      password: process.env.PG_PASS,
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
