const member = require('../data-layer/member');

class MemberService {
  createChamaMember(data) {
    return member.createChamaMember(data);
  }

  getChamaMember(chama_id) {
    return member.getChamaMember(chama_id);
  }

  getChamaMemberByPhone(phone) {
    return member.getChamaMemberByPhone(phone);
  }

  listChamaMembers(chama_id) {
    return member.listChamaMembers(chama_id);
  }
}

module.exports = new MemberService();
