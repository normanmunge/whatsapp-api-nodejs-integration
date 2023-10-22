const transactions = require('../data-layer/transactions');

class TransactionService {
  constructor() {}

  sumTotalChamaTransactions(id) {
    return transactions.sumTotalChamaTransactions(id);
  }

  sumMemberChamaTransactions(id, member) {
    return transactions.sumMemberChamaTransactions(id, member);
  }
  sumCurrentChamaTransactions(id, member, month) {
    return;
  }

  fetchCurrentChamaPaidMembers(id, start_date, end_date) {
    return;
  }
}

module.exports = new TransactionService();
