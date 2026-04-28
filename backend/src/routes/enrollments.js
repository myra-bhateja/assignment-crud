const express = require('express');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find()
      .populate('studentId', 'name year')
      .populate('courseId', 'name code')
      .sort({ createdAt: -1 })
      .lean();
    res.json(enrollments);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { studentId, courseId } = req.body;

    const student = await Student.findById(studentId).lean();
    const course = await Course.findById(courseId).lean();

    if (!student || !course) {
      return res.status(400).json({ message: 'Invalid student or course' });
    }

    const enrollment = await Enrollment.create({ studentId, courseId });
    res.status(201).json(enrollment);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { studentId, courseId } = req.body;

    const student = await Student.findById(studentId).lean();
    const course = await Course.findById(courseId).lean();

    if (!student || !course) {
      return res.status(400).json({ message: 'Invalid student or course' });
    }

    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { studentId, courseId },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    return res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const removed = await Enrollment.findByIdAndDelete(req.params.id).lean();
    if (!removed) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    return res.json({ ok: true });
  })
);

module.exports = router;
