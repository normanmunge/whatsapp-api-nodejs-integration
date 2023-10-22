//postgres
const chamaService = require('../service/chama');
const memberService = require('../service/member');

class MemberUtility {
  constructor() {}

  async fetchChama(id) {
    return await chamaService.getChama(id).then(async (data) => {
      const { id, current_cycle_count } = data;
      const contrib_frequency =
        await chamaService.getChamaContributionFrequency(id);

      const members = await memberService.listChamaMembers(id);

      let next_recipient = await chamaService.getChamaNextRecipient(
        id,
        current_cycle_count
      );

      if (next_recipient) {
        const { member_id } = next_recipient;
        const user = members.filter((user) => {
          return user.id === member_id;
        });
        next_recipient = user[0];
      }

      // let contributions = await

      const extra_details = {
        frequency: contrib_frequency,
        next_recipient: next_recipient,
        members: members,
      };
      return Object.assign(data, extra_details);
    });
  }

  async fetchTransactionDetails() {}
}

module.exports = new MemberUtility();
