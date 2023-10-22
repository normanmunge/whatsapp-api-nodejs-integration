/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const fs = require('fs');
const path = require('path');
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('member_paid').del();
  await knex('member_paid').insert([
    {
      id: 1,
      chama_id: 1,
      member_id: 1,
      payment_transaction_id: 2,
      chama_cycle_count_id: 1,
    },
    {
      id: 2,
      chama_id: 1,
      member_id: 2,
      payment_transaction_id: 1,
      chama_cycle_count_id: 1,
    },
  ]);
};
