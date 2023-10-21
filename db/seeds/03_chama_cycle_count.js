/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const fs = require('fs');
const path = require('path');
let chama_cycle_count = fs.readFileSync(
  path.join(__dirname, '..', 'examples', 'chama_cycle_count.json')
);

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('chama_cycle_count').del();
  await knex('chama_cycle_count').insert([
    {
      id: 1,
      chama_id: 1,
      start_date: '2023-10-22',
      end_date: '2023-10-24',
    },
    {
      id: 2,
      chama_id: 2,
      start_date: '2023-10-22',
      end_date: '2023-10-24',
    },
  ]);
};
