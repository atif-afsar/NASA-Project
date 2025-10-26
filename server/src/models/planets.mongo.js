const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
  keplerName: { type: String, required: true, unique: true },
  koi_disposition: { type: String },
  koi_insol: { type: Number },
  koi_prad: { type: Number },
});

module.exports = mongoose.model('Planet', planetSchema);
