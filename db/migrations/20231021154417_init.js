const { table } = require('..');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('chama', (table) => {
      table.increments();
      table.string('name', 255).notNullable().defaultTo('Wekeza Chama');
      table.string('wekeza_account_no', 255).unique();
      table.string('type', 255);
      table.string('description', 1000);
      table.integer('current_cycle_count', 255).notNullable().defaultTo(1);
      table.string('default_phone_number', 255);
      table.string('email', 255);
      table.string('bank_account_name', 255);
      table.string('bank_account_no', 255);
      table.string('bank_account_paybill', 255);
      table.timestamps(true, true);
    })
    .createTable('chama_contribution_frequency', (table) => {
      table.increments();
      table.integer('chama_id').unsigned().notNullable();
      table
        .foreign('chama_id')
        .references('id')
        .inTable('chama')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.decimal('contribution_amount', 255).notNullable().defaultTo(0);
      table.string('frequency').notNullable();
      table.integer('deadline_day', 255).notNullable().defaultTo(0);
      table.integer('extension_period', 255).notNullable().defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('members', (table) => {
      table.increments('');
      table.integer('chama_id').unsigned().notNullable();
      table
        .foreign('chama_id')
        .references('id')
        .inTable('chama')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.string('name', 255);
      table.string('phone_number').notNullable();
      table.string('password', 255);
      table.string('alternate_phone_number');
      table.boolean('whatsapp_opt_in').notNullable().defaultTo(true);
      table.boolean('is_official').notNullable().defaultTo(false);
      table.enu('type', [
        'administrator',
        'secretary',
        'treasurer',
        'member',
        'other',
      ]);
      table.timestamps(true, true);
    })
    .createTable('chama_cycle_count', (table) => {
      table.increments();
      table.integer('chama_id').unsigned().notNullable();
      table
        .foreign('chama_id')
        .references('id')
        .inTable('chama')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.date('start_date');
      table.date('end_date');
      table.timestamps(true, true);
    })
    .createTable('member_cycle_count', (table) => {
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
      table.integer('chama_cycle_count').unsigned().notNullable();
      table
        .foreign('chama_cycle_count')
        .references('id')
        .inTable('chama_cycle_count')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.integer('cycle_number', 255).notNullable().defaultTo(1);
      table.timestamps(true, true);
    })
    .createTable('payment_gateway', (table) => {
      table.increments();
      table.string('name', 255).notNullable();
      table.timestamps(true, true);
    })
    .createTable('payment_transactions', (table) => {
      table.increments();
      table.integer('payment_gateway_id').unsigned().notNullable();
      table
        .foreign('payment_gateway_id')
        .references('id')
        .inTable('payment_gateway')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.integer('chama_id').unsigned().notNullable();
      table
        .foreign('chama_id')
        .references('id')
        .inTable('chama')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.integer('sender_id').unsigned().notNullable();
      table
        .foreign('sender_id')
        .references('id')
        .inTable('members')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.integer('recipient_id').unsigned().notNullable();
      table
        .foreign('recipient_id')
        .references('id')
        .inTable('members')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      table.decimal('contribution_amount', 255).notNullable().defaultTo(0);
      table.string('transaction_type', 255).notNullable();
      table.string('transaction_category', 255).notNullable();
      table.string('transaction_status', 255).notNullable();
      table.datetime('transaction_datetime').notNullable();
      table.timestamps(true, true);
    });
  // .createTable('chama_reports', (table) => {
  //   table.increments('report_id').primary();
  //   table.integer('sender_id').unsigned().notNullable();
  //   table
  //     .foreign('sender_id')
  //     .references('sender_id')
  //     .inTable('payment_transactions')
  //     .onDelete('CASCADE')
  //     .onUpdate('CASCADE');
  //   table.timestamps(true, true);
  // });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable('chama_reports')
    .dropTable('payment_transactions')
    .dropTable('payment_gateway')
    .dropTable('member_cycle_count')
    .dropTable('members')
    .dropTable('chama_cycle_count')
    .dropTable('chama_contribution_frequency')
    .dropTable('chama');
};
