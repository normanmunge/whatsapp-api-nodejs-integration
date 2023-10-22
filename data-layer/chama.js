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

  async getChamaContributionFrequency(id) {
    const frequency = await db('chama_contribution_frequency')
      .where('chama_id', id)
      .first();
    return frequency;
  }

  async getChamaNextRecipient(id, cycle) {
    const next_cycle_count = cycle + 1;
    const recipient = await db('member_cycle_count')
      .where('chama_id', id)
      .where('cycle_number', next_cycle_count)
      .first();
    return recipient;
  }
}

module.exports = new ChamaDataLayer();
