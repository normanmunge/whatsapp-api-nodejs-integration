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
  async sumCurrentChamaTransactions(id, member, month) {
    return;
  }
}

module.exports = new TransactionsDataLayer();
