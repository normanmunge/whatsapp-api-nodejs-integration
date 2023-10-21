//firebase
const { User, getMemberDetails } = require('../firebase/User');

class Chama {
  constructor() {}

  async createChama(req, res) {}

  async getChama(req, res) {}

  async getChamaMembers(req, res) {
    try {
      const data = req.body;
      //res.status(201).json()
      res.send(getMemberDetails(data.phone));
    } catch (error) {
      console.log('ERROR GETTING MEMBERS', error);
      res.status(500).json({ error: error });
    }
  }

  async createChamaMember(req, res) {
    try {
      const data = req.body;
      const memberRef = User.doc();
      await memberRef.set(data);

      res.status(201).json({ data: 'User added' });
    } catch (error) {
      console.log('ERROR CREATING MEMBER', error);
      res.status(403).json({ error: error });
      return;
    }
  }
}

module.exports = new Chama();
