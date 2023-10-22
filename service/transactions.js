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

  fetchCurrentChamaPaidMembers(id, member) {
    return transactions.fetchCurrentChamaPaidMembers(id, member);
  }
}

module.exports = new TransactionService();
