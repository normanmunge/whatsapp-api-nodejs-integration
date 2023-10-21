const db = require('../db/index');

class ChamaDataLayer {
  constructor() {
    this.data;
  }

  async createChama(data) {
    const [id] = await db.insert(data).returning('id');

    return id;
  }

  async getChama(id) {
    const chama = await db('chama').where('id', id).first();
    return chama;
  }
}

module.exports = new ChamaDataLayer();
