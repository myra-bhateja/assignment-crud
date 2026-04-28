const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const courses = await Course.find().sort({ name: 1 }).lean();
    res.json(courses);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, code } = req.body;
    const course = await Course.create({ name, code });
    res.status(201).json(course);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, code } = req.body;
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { name, code },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    await Enrollment.deleteMany({ courseId });
    const removed = await Course.findByIdAndDelete(courseId).lean();

    if (!removed) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.json({ ok: true });
  })
);

module.exports = router;
