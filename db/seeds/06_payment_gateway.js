/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const fs = require('fs');
const path = require('path');
let payment_gateway = fs.readFileSync(
  path.join(__dirname, '..', 'examples', 'payment_gateway.json')
);

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('payment_gateway').del();
  await knex('payment_gateway').insert([
    {
      id: 1,
      name: 'Bank wave',
    },
  ]);
};
