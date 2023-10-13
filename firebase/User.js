const { db, collection } = require('./config');
const { Chama, Reports, ChamaCycleCount } = require('./Chama');
const { Filter } = require('firebase-admin/firestore');

const User = db.collection('Members');

const getMember = async (phone) => {
  const member_snapshot = await User.where('phone_number', '==', phone).get();

  let member = null;

  member_snapshot.forEach((doc) => {
    member = doc.data();
  });

  if (member) {
    return member;
  }

  return null;
};

const getMemberDetails = async (phone_no) => {
  const phone = phone_no.toString();

  const dtls = await getMember(phone);
  const { chama, cycle_count, name, phone_number, is_offical } = dtls;

  if (chama) {
    let chama_profile,
      next_recipient_member = null;

    const chama_member_snapshot = Chama.doc(chama);

    const chama_doc = await chama_member_snapshot.get();

    if (!chama_doc.exists) {
      console.log('No such document');
      return;
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
      const { amount_received } = doc.data();
      ind_contributions.push(amount_received);
    });

    const ind_total_chama_contributions = ind_contributions.reduce(
      (acc, currentValue) => acc + currentValue,
      0
    );

    //Next recipient member
    const nextRecipientMemberSnapshot = await User.where('chama', '==', chama)
      .where('cycle_count', '==', cycle_count + 1)
      .get();

    // const nextRecipientMemberSnapshot = await User.where(
    //   Filter.and(
    //     Filter.where('chama', '==', chama),
    //     Filter.where('cycle_count', '==', cycle_count + 1)
    //   )
    // ).get();

    nextRecipientMemberSnapshot.forEach((doc) => {
      next_recipient_member = doc.data();
    });

    const details = {
      member: dtls,
      chama: chama_profile,
      total_chama_contributions: total_chama_contributions,
      ind_total_chama_contributions: ind_total_chama_contributions,
      next_recipient_member: next_recipient_member,
    };

    return details;
  }

  return null;
};

module.exports = { User, getMember, getMemberDetails };
