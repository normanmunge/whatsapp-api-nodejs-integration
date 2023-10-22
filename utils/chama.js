//postgres
const chamaService = require('../service/chama');
const memberService = require('../service/member');
const transactionService = require('../service/transactions');

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
      const { member_id } = next_recipient;

      if (next_recipient) {
        const user = members.filter((user) => {
          return user.id === member_id;
        });
        next_recipient = user[0];
      }

      let total_contributions =
        await transactionService.sumTotalChamaTransactions(id);
      let your_contributions =
        await transactionService.sumMemberChamaTransactions(id, member_id);

      //   const date = new Date();
      //   const months_of_the_year = [
      //     'January',
      //     'February',
      //     'March',
      //     'April',
      //     'May',
      //     'June',
      //     'July',
      //     'August',
      //     'September',
      //     'October',
      //     'November',
      //     'December',
      //   ];

      //   const current_month = months_of_the_year[date.getMonth()];

      //   let current_contributions =
      //     await transactionService.sumCurrentChamaTransactions(
      //       id,
      //       member_id,
      //       current_month
      //     );

      const extra_details = {
        frequency: contrib_frequency,
        next_recipient: next_recipient,
        members: members,
        total_contributions: total_contributions[0].sum,
        your_contributions: your_contributions[0].sum,
      };
      return Object.assign(data, extra_details);
    });
  }

  async fetchTransactionDetails() {}
}

module.exports = new MemberUtility();
