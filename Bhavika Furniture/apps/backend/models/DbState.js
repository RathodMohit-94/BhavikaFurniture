const mongoose = require('mongoose');

const dbStateSchema = new mongoose.Schema({
  data: { type: Object, required: true }
}, { minimize: false });

module.exports = mongoose.model('DbState', dbStateSchema);
