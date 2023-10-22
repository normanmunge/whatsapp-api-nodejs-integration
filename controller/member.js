//postgres
const memberService = require('../service/member');
const memberUtil = require('../utils/member');

class Member {
  constructor() {}

  //members
  //Firebase solution
  //   async createChamaMember(req, res) {
  //     try {
  //       const data = req.body;
  //       const memberRef = User.doc();
  //       await memberRef.set(data);

  //       res.status(201).json({ data: 'User added' });
  //     } catch (error) {
  //       console.log('ERROR CREATING MEMBER', error);
  //       res.status(403).json({ error: error });
  //       return;
  //     }
  //   }

  //   async getChamaMembers(req, res) {
  //     try {
  //       const data = req.body;
  //       //res.status(201).json()
  //       res.send(getMemberDetails(data.phone));
  //     } catch (error) {
  //       console.log('ERROR GETTING MEMBERS', error);
  //       res.status(500).json({ error: error });
  //     }
  //   }

  async createChamaMember(req, res) {
    try {
      const {
        chama_id,
        name,
        phone_number,
        password,
        alternate_phone_number,
        whatsapp_opt_in,
        is_official,
        type,
      } = req.body;

      const data = {
        chama_id: chama_id,
        name: name,
        phone_number: phone_number,
        password: password,
        alternate_phone_number: alternate_phone_number,
        whatsapp_opt_in: whatsapp_opt_in,
        type: type,
        is_official: is_official,
      };
      const id = await memberService.createChamaMember(data);
      res.status(201).json({ data: id, message: 'Member added successfully!' });
    } catch (error) {
      console.log('ERROR CREATING MEMBER', error);
      res.status(500).json({ error: error });
    }
  }

  async getChamaMember(req, res) {
    try {
      const id = req.params.id;
      const member = await memberUtil.fetchChamaMember(id);
      res.status(200).json(member);
    } catch (error) {
      console.log('ERROR RETURNING MEMBER', error);
      res.status(500).json({ error: error });
    }
  }

  //http://localhost:3000/getChamaMember?chama_id=1
  async listChamaMembers(req, res) {
    try {
      const id = req.query.chama_id;
      const members = await memberService.listChamaMembers(id);
      res.status(200).json(members);
    } catch (error) {
      console.log('ERROR RETURNING MEMBERS', error);
      res.status(500).json({ error: error });
    }
  }
}

module.exports = new Member();
