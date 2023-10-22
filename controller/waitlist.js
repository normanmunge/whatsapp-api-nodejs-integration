const { Joinlist } = require('../firebase/JoinList');

class Waitlist {
  constructor() {}

  async joinList(req, res) {
    try {
      const data = req.body;
      const { name, email, phone } = req.body;
      const registrationRef = Joinlist.doc();
      await registrationRef.set({
        name: name,
        email: email,
        phone: phone,
      });
      res.status(201).json({
        data: `We're thrilled to have you on board! \n Keep an eye on your inbox – our support team will be in touch with you in the coming days. \n Get ready for an exciting journey ahead!`,
      });
    } catch (error) {
      console.log('ERROR JOINING LIST:', error);
      res.status(500).json({
        error: error,
      });
    }
  }
}

module.exports = new Waitlist();
