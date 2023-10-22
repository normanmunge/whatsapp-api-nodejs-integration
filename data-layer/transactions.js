const db = require('../db/index');

class TransactionsDataLayer {
  constructor() {}

  async sumTotalChamaTransactions(id) {
    const total = await db('payment_transactions')
      .where('chama_id', id)
      .sum('contribution_amount');
    return total;
  }

  async sumMemberChamaTransactions(id, member) {
    const total = await db('payment_transactions')
      .where('chama_id', id)
      .where('sender_id', member)
      .sum('contribution_amount');
    return total;
  }
  async sumCurrentChamaTransactions(id, member) {
    return;
  }

  async fetchCurrentChamaPaidMembers(id) {
    const paid_members_rows = await db('payment_transactions')
      .where('chama_id', id)
      .where('transaction_datetime', '>=', '2023-10-22')
      .where('transaction_datetime', '<', '2023-10-24');

    return paid_members_rows;
  }
}

module.exports = new TransactionsDataLayer();
