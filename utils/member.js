//postgres
const memberService = require('../service/member');

class MemberUtility {
  constructor() {}

  async fetchChamaMember(id) {
    return await memberService.getChamaMember(id);
  }

  async fetchChamaMemberByPhone(phone) {
    return await memberService.getChamaMemberByPhone(phone);
  }
}

module.exports = new MemberUtility();
