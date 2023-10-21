/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const fs = require('fs');
const path = require('path');
let payment_transactions = fs.readFileSync(
  path.join(__dirname, '..', 'examples', 'payment_transactions.json')
);

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('payment_transactions').del();
  await knex('payment_transactions').insert([
    {
      id: 1,
      payment_gateway_id: 1,
      chama_id: 1,
      sender_id: 2,
      recipient_id: 1,
      contribution_amount: 10,
      transaction_type: 'send-to-phone-number',
      transaction_category: 'debit',
      transaction_status: 'in_progress',
      transaction_datetime: '2023-10-14T07:48:22.958671Z',
    },
    {
      id: 2,
      payment_gateway_id: 1,
      chama_id: 1,
      sender_id: 1,
      recipient_id: 2,
      contribution_amount: 10,
      transaction_type: 'send-to-phone-number',
      transaction_category: 'debit',
      transaction_status: 'in_progress',
      transaction_datetime: '2023-10-14T07:48:22.958671Z',
    },
  ]);
};
