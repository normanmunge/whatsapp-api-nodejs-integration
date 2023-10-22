const chama = require('../data-layer/chama');
//TODO: Create error handling from database and return message;
class ChamaService {
  createChama(data) {
    return chama.createChama(data);
  }

  getChama(id) {
    return chama.getChama(id);
  }

  getChamaContributionFrequency(id) {
    return chama.getChamaContributionFrequency(id);
  }

  getChamaNextRecipient(id, cycle_count) {
    return chama.getChamaNextRecipient(id, cycle_count);
  }
}

module.exports = new ChamaService();
