const { db, collection } = require('./config');
const { Chama, Reports, ChamaCycleCount } = require('./Chama');

const User = db.collection('Members');

const getMemberDetails = async (phone_no) => {
  const phone = phone_no.toString();

  const member_snapshot = await User.where('phone_number', '==', phone).get();

  let member,
    chama_profile,
    next_recipient_member = null;

  member_snapshot.forEach((doc) => {
    console.log('THE USERS ARE:', doc.data());
    member = doc.data();
  });

  if (member) {
    const { chama, cycle_count, name, phone_number, is_offical } = member;

    const chama_snapshot = Chama.doc(chama);
    const chama_doc = await chama_snapshot.get();

    if (!chama_doc.exists) {
      console.log('No such document');
    } else {
      chama_profile = chama_doc.data();
    }

    //Total Chama Contributions :: todo can be simplified into a reusable function
    const contributions = [];
    const chama_contribution = await Reports.where('chama', '==', chama).get();
    chama_contribution.forEach((doc) => {
      const { amount_received } = doc.data();
      contributions.push(amount_received);
    });

    const total_chama_contributions = contributions.reduce(
      (acc, currentValue) => acc + currentValue,
      0
    );

    //Individual member total contributions
    const ind_contributions = [];
    const ind_chama_contribution = await Reports.where('chama', '==', chama)
      .where('member_phone', '==', phone_number)
      .get();
    ind_chama_contribution.forEach((doc) => {
      console.log('THE Individual CONTRIBUTIONS ARE:', doc.data());
      const { amount_received } = doc.data();
      ind_contributions.push(amount_received);
    });

    const ind_total_chama_contributions = ind_contributions.reduce(
      (acc, currentValue) => acc + currentValue,
      0
    );

    //Next recipient member
    const nextRecipientMemberSnapshot = await User.where(
      'chama',
      '==',
      chama
    ).where('cycle_count', '==', cycle_count + 1);

    console.log('THE NEXT RECIPIENT', nextRecipientMemberSnapshot);

    nextRecipientMemberSnapshot.forEach((doc) => {
      next_recipient_member = doc.data();
    });

    console.log(
      'THE MEMBER DATA IS:',
      member,
      'AND THE PROFILE:',
      chama_profile,
      'THE CONTRIBUTIONS:',
      contributions,
      'THE TOTAL CONTRIBUTIONS ARE:',
      total_chama_contributions,
      'THE INDIVIDUAL CONTRIBUTIONS ARE:',
      ind_total_chama_contributions,
      'THE NEXT RECIPIENT IS:',
      next_recipient_member
    );

    const details = {
      member: member,
      chama: chama_profile,
      total_chama_contributions: total_chama_contributions,
      ind_total_chama_contributions: ind_total_chama_contributions,
      next_recipient_member: next_recipient_member,
    };

    return details;
  }
  return null;
};

module.exports = { User, getMemberDetails };
