const { db, collection } = require('./config');
const { Chama, Reports, ChamaCycleCount } = require('./Chama');
const { Filter } = require('firebase-admin/firestore');

const User = db.collection('Members');

let current_member = null;
let total_chama_members = 0;

const getMember = async (phone) => {
  if (
    current_member &&
    typeof current_member === 'object' &&
    current_member?.phone_number === phone
  ) {
    return current_member;
  }
  const member_snapshot = await User.where('phone_number', '==', phone).get();

  console.log('THE MEMBER SNAPSHOT', member_snapshot);

  if (member_snapshot.length) {
    let member = null;
    let id = null;
    total_chama_members = member_snapshot.length;

    member_snapshot.forEach((doc) => {
      member = doc.data();
      id = doc.id;
    });

    if (member) {
      current_member = member;
      current_member['id'] = id;
      return member;
    }
  }

  return null;
};

const getMemberDetails = async (phone_no) => {
  const phone = phone_no.toString();

  const dtls = await getMember(phone);

  if (dtls) {
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
        current_member['chama_profile'] = chama_profile;
      }

      //Total Chama Contributions :: todo can be simplified into a reusable function
      const contributions = [];
      //Individual member total contributions
      const ind_contributions = [];

      const chama_contribution = await Reports.where(
        'chama',
        '==',
        chama
      ).get();

      chama_contribution.forEach((doc) => {
        const { amount_received, member_phone } = doc.data();
        contributions.push(amount_received);
        if (member_phone === phone_number) {
          ind_contributions.push(amount_received);
        }
      });

      const total_chama_contributions = contributions.reduce(
        (acc, currentValue) => acc + currentValue,
        0
      );

      // //Individual member total contributions
      // const ind_contributions = [];

      // const ind_chama_contribution = await Reports.where('chama', '==', chama)
      //   .where('member_phone', '==', phone_number)
      //   .get();
      // ind_chama_contribution.forEach((doc) => {
      //   const { amount_received } = doc.data();
      //   ind_contributions.push(amount_received);
      // });

      const ind_total_chama_contributions = ind_contributions.reduce(
        (acc, currentValue) => acc + currentValue,
        0
      );

      //reset the cyclec count if it's the last member
      let next_recipient_cycle =
        cycle_count === total_chama_members ? 1 : cycle_count + 1;

      //Next recipient member
      if (
        typeof current_member === 'object' &&
        current_member?.next_recipient_member?.cycle_count ===
          next_recipient_cycle
      ) {
        next_recipient_member = current_member['next_recipient_member'];
      } else {
        const nextRecipientMemberSnapshot = await User.where(
          'chama',
          '==',
          chama
        )
          .where('cycle_count', '==', next_recipient_cycle)
          .get();

        nextRecipientMemberSnapshot.forEach((doc) => {
          next_recipient_member = doc.data();
          current_member['next_recipient_member'] = next_recipient_member;
          current_member['next_recipient_id'] = doc.id;
        });
      }

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
  } else {
    return null;
  }
};

module.exports = { User, getMember, getMemberDetails };
