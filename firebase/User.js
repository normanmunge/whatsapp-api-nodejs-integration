const { db, collection } = require('./config');
const { Chama, Reports } = require('./Chama');

const User = db.collection('Members');

const getMemberDetails = async (phone_no) => {
  const phone = phone_no.toString();

  const member_snapshot = await User.where('phone_number', '==', phone).get();

  let member,
    chama_profile = null;

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

    const contributions = [];
    const chama_contribution = await Reports.where('chama', '==', chama).get();
    chama_contribution.forEach((doc) => {
      console.log('THE CONTRIBUTIONS ARE:', doc.data());
      const { amount_received } = doc.data();
      contributions.push(amount_received);
    });

    const total_chama_contributions = contributions.reduce(
      (acc, currentValue) => acc + currentValue,
      0
    );

    console.log(
      'THE MEMBER DATA IS:',
      member,
      'AND THE PROFILE:',
      chama_profile,
      'THE CONTRIBUTIONS:',
      contributions,
      'THE TOTAL CONTRIBUTIONS ARE:',
      total_chama_contributions
    );

    const details = {
      member: member,
      chama: chama_profile,
      total_chama_contributions: total_chama_contributions,
    };

    return details;
  }
  return null;
};

module.exports = { User, getMemberDetails };
