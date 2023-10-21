/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const fs = require('fs');
const path = require('path');
let chama_contrib_frequency = fs.readFileSync(
  path.join(__dirname, '..', 'examples', 'chama_contribution_frequency.json')
);
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('chama_contribution_frequency').del();
  await knex('chama_contribution_frequency').insert([
    {
      id: 1,
      chama_id: 1,
      contribution_amount: 1,
      frequency: 'daily',
      deadline_day: 3,
      extension_period: 1,
    },
    {
      id: 2,
      chama_id: 2,
      contribution_amount: 300,
      frequency: 'daily',
      deadline_day: 3,
      extension_period: 1,
    },
  ]);
};
