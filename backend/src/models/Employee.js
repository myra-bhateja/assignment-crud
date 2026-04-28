const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
