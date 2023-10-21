const chama = require('../data-layer/chama');
//TODO: Create error handling from database and return message;
class ChamaService {
  createChama(data) {
    return chama.createChama(data);
  }

  getChama(id) {
    return chama.getChama(id);
  }
}

module.exports = new ChamaService();
