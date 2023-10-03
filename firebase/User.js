const { db, collection } = require('./config');

const User = db.collection('Members');

module.exports = User;
