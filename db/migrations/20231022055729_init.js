/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('payment_transactions', function (table) {
    table.string('payment_gateway_response_id', 255).alter();
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
