/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('member_paid', (table) => {
    table.increments();
    table.integer('chama_id').unsigned().notNullable();
    table
      .foreign('chama_id')
      .references('id')
      .inTable('chama')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.integer('member_id').unsigned().notNullable();
    table
      .foreign('member_id')
      .references('id')
      .inTable('members')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.integer('payment_transaction_id').unsigned().notNullable();
    table
      .foreign('payment_transaction_id')
      .references('id')
      .inTable('payment_transactions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.integer('chama_cycle_count_id').unsigned().notNullable();
    table
      .foreign('chama_cycle_count_id')
      .references('id')
      .inTable('chama_cycle_count')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('member_paid');
};
