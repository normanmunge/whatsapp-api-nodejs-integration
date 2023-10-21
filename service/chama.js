const chama = require('../data-layer/chama');
//TODO: Create error handling from database and return message;
class ChamaService {
  createChama(data) {
    return chama.createChama(data);
  }
}

module.exports = new ChamaService();
