const db = require('../db/index');

class ChamaDataLayer {
  constructor() {
    this.data;
  }

  async createChama(data) {
    const [id] = await db.insert(data).returning('id');

    return id;
  }
  getChama(phone) {}
}

module.exports = new ChamaDataLayer();
