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

  createTransactionRecord(data) {
    return transactions.createTransaction(data);
  }

  updateTransactionRecord(id, data) {
    return transactions.updateTransaction(id, data);
  }
}

module.exports = new TransactionService();
