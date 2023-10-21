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
        data: `Happy to have you onboard! Our support team will reach out to you in the next few days.`,
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
