const express = require('express');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const students = await Student.find().sort({ name: 1 }).lean();
    res.json(students);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, year } = req.body;
    const student = await Student.create({ name, year });
    res.status(201).json(student);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, year } = req.body;
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { name, year },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const studentId = req.params.id;
    const existing = await Student.findById(studentId).lean();
    if (!existing) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Enrollment.deleteMany({ studentId });
    await Course.updateMany({ students: studentId }, { $pull: { students: studentId } });
    await Student.findByIdAndDelete(studentId).lean();

    return res.json({ ok: true });
  })
);

module.exports = router;
