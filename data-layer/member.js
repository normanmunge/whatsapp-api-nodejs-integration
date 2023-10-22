const db = require('../db/index');

class ChamaMember {
  constructor() {
    this.data;
  }

  async createChamaMember(data) {
    const [id] = await db.insert(data).returning('id');

    return id;
  }

  async getChamaMember(id) {
    const member = await db('members').where('id', id).first();
    return member;
  }

  //TODO: Add logic when user belongs to more than one chama -> WP2-38
  async getChamaMemberByPhone(phone) {
    const member = await db('members').where('phone_number', phone).first();
    return member;
  }

  async listChamaMembers(id) {
    const members = await db.select('*').from('members').where('chama_id', id);
    return members;
  }
}

module.exports = new ChamaMember();
