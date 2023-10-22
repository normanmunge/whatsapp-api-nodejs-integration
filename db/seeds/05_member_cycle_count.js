/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const fs = require('fs');
const path = require('path');
let member_cycle_count = fs.readFileSync(
  path.join(__dirname, '..', 'examples', 'member_cycle_count.json')
);

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('member_cycle_count').del();
  await knex('member_cycle_count').insert([
    {
      id: 1,
      chama_id: 1,
      member_id: 1,
      chama_cycle_count: 1,
      cycle_number: 1,
    },
    {
      id: 2,
      chama_id: 1,
      member_id: 2,
      chama_cycle_count: 1,
      cycle_number: 2,
    },
    {
      id: 3,
      chama_id: 2,
      member_id: 3,
      chama_cycle_count: 2,
      cycle_number: 13,
    },
    {
      id: 4,
      chama_id: 2,
      member_id: 3,
      chama_cycle_count: 2,
      cycle_number: 5,
    },
    {
      id: 7,
      chama_id: 2,
      member_id: 3,
      chama_cycle_count: 2,
      cycle_number: 2,
    },
    {
      id: 15,
      chama_id: 2,
      member_id: 3,
      chama_cycle_count: 2,
      cycle_number: 4,
    },
    {
      id: 5,
      chama_id: 2,
      member_id: 4,
      chama_cycle_count: 2,
      cycle_number: 12,
    },
    {
      id: 6,
      chama_id: 2,
      member_id: 5,
      chama_cycle_count: 2,
      cycle_number: 1,
    },

    {
      id: 8,
      chama_id: 2,
      member_id: 6,
      chama_cycle_count: 2,
      cycle_number: 3,
    },
    {
      id: 9,
      chama_id: 2,
      member_id: 7,
      chama_cycle_count: 2,
      cycle_number: 10,
    },
    {
      id: 10,
      chama_id: 2,
      member_id: 8,
      chama_cycle_count: 2,
      cycle_number: 9,
    },
    {
      id: 11,
      chama_id: 2,
      member_id: 9,
      chama_cycle_count: 2,
      cycle_number: 7,
    },
    {
      id: 13,
      chama_id: 2,
      member_id: 10,
      chama_cycle_count: 2,
      cycle_number: 8,
    },
    {
      id: 14,
      chama_id: 2,
      member_id: 11,
      chama_cycle_count: 2,
      cycle_number: 6,
    },
    {
      id: 16,
      chama_id: 2,
      member_id: 12,
      chama_cycle_count: 2,
      cycle_number: 11,
    },
  ]);
};
