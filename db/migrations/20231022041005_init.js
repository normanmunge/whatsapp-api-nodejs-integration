/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('payment_transactions', function (table) {
    table.integer('payment_gateway_response_id').unique();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('payment_transactions', function (table) {
    table.dropColumn('payment_gateway_response_id');
  });
};
