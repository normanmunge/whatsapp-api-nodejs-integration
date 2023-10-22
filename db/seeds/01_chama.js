/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const fs = require('fs');
const path = require('path');
let chamas = fs.readFileSync(path.join(__dirname, '..', 'examples/chama.json'));
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('chama').del();
  await knex('chama').insert([
    {
      id: 1,
      name: 'Wekeza Test Chama',
      wekeza_account_no: '534953',
      type: 'merry-go-round',
      description: '',
      current_cycle_count: 1,
      default_phone_number: '254712658102',
      email: 'hello@wekezafrica.com',
      bank_account_name: '',
      bank_account_no: '',
      bank_account_paybill: '',
    },
    {
      id: 2,
      name: 'Girls club helping',
      wekeza_account_no: '237764',
      type: 'merry-go-round',
      description: '',
      current_cycle_count: 7,
      default_phone_number: '',
      email: '',
      bank_account_name: '',
      bank_account_no: '',
      bank_account_paybill: '',
    },
  ]);
};
