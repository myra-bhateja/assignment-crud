const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1, max: 6 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
