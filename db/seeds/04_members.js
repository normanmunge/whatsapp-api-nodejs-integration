/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const fs = require('fs');
const path = require('path');
let members = fs.readFileSync(
  path.join(__dirname, '..', 'examples', 'members.json')
);

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('members').del();
  await knex('members').insert([
    {
      id: 1,
      chama_id: 1,
      name: 'Norman Munge',
      phone_number: '254712658102',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: true,
      type: 'administrator',
    },
    {
      id: 2,
      chama_id: 1,
      name: 'James Muriithi',
      //phone_number: '254726333555',
      phone_number: '254798420532',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
    {
      id: 3,
      chama_id: 2,
      name: 'Esther Nyakio',
      phone_number: '254768154750',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: true,
      type: 'administrator',
    },
    {
      id: 4,
      chama_id: 2,
      name: 'Grace Njambi',
      phone_number: '254721736558',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
    {
      id: 5,
      chama_id: 2,
      name: 'Sharon Odari',
      phone_number: '254115261566',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
    {
      id: 6,
      chama_id: 2,
      name: 'Gladys Kayla',
      phone_number: '254790317477',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
    {
      id: 7,
      chama_id: 2,
      name: 'June Mwangi',
      phone_number: '254722645914',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
    {
      id: 8,
      chama_id: 2,
      name: 'Sydney Mise',
      phone_number: '254769260680',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
    {
      id: 9,
      chama_id: 2,
      name: 'Karen Mbaabu',
      phone_number: '254727742875',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
    {
      id: 10,
      chama_id: 2,
      name: 'Fiona Mutuku',
      phone_number: '254726972217',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
    {
      id: 11,
      chama_id: 2,
      name: 'Caro Kendi',
      phone_number: '254729825213',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
    {
      id: 12,
      chama_id: 2,
      name: 'Martha Kamau',
      phone_number: '254706387771',
      password: '',
      alternate_phone_number: '',
      whatsapp_opt_in: true,
      is_official: false,
      type: 'member',
    },
  ]);
};
