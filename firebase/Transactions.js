const { db } = require('./config');
const Collections = db.collection('Collection_transactions');

module.exports = { Collections };
