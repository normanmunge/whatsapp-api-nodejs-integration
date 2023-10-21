//postgres
const chamaService = require('../service/chama');

//firebase
const { User, getMemberDetails } = require('../firebase/User');

class Chama {
  constructor() {}

  //Firebase solution
  // async createChamaMember(req, res) {
  //   try {
  //     const data = req.body;
  //     const memberRef = User.doc();
  //     await memberRef.set(data);

  //     res.status(201).json({ data: 'User added' });
  //   } catch (error) {
  //     console.log('ERROR CREATING MEMBER', error);
  //     res.status(403).json({ error: error });
  //     return;
  //   }
  // }

  async createChamaMember(req, res) {
    try {
      const {
        name,
        type,
        description,
        current_cycle_count,
        default_phone_number,
        email,
        bank_account_name,
        bank_account_no,
        bank_account_paybill,
      } = req.body;

      const data = {
        name: name,
        type: type,
        description: description,
        current_cycle_count: current_cycle_count,
        default_phone_number: default_phone_number,
        email: email,
        bank_account_name: bank_account_name,
        bank_account_no: bank_account_no,
        bank_account_paybill: bank_account_paybill,
      };
      const id = await chamaService.createChama(data);
      res.status(201).json({ data: id, message: 'Chama added successfully!' });
    } catch (error) {
      console.log('ERROR CREATING CHAMA', error);
      res.status(400).json({ error: error });
    }
  }

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
}

module.exports = new Chama();
