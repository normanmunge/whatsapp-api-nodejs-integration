const { db, collection } = require('./config');

const Chama = db.collection('Chama');
const ChamaCycleCount = db.collection('Chama_cycle');
const Reports = db.collection('Contribution_reports');

module.exports = { Chama, Reports, ChamaCycleCount };
