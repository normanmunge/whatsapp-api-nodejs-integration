const { db, collection } = require('./config');

const Chama = db.collection('Chama');
const Reports = db.collection('Contribution_reports');

module.exports = { Chama, Reports };
