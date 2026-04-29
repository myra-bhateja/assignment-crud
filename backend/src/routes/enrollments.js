const express = require('express');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const syncStudentCourses = async (studentId) => {
  if (!studentId) {
    return;
  }

  const enrollments = await Enrollment.find({ studentId }).select('courseId').lean();
  const courseIds = enrollments.map((enrollment) => enrollment.courseId);
  await Student.findByIdAndUpdate(studentId, { courses: courseIds });
};

const syncCourseStudents = async (courseId) => {
  if (!courseId) {
    return;
  }

  const enrollments = await Enrollment.find({ courseId }).select('studentId').lean();
  const studentIds = enrollments.map((enrollment) => enrollment.studentId);
  await Course.findByIdAndUpdate(courseId, { students: studentIds });
};

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
    await Promise.all([
      syncStudentCourses(studentId),
      syncCourseStudents(courseId)
    ]);
    res.status(201).json(enrollment);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { studentId, courseId } = req.body;

    const existing = await Enrollment.findById(req.params.id).lean();
    if (!existing) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

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

    const studentIdsToSync = new Set([
      String(existing.studentId),
      String(studentId)
    ]);
    const courseIdsToSync = new Set([
      String(existing.courseId),
      String(courseId)
    ]);
    await Promise.all([
      ...[...studentIdsToSync].map((id) => syncStudentCourses(id)),
      ...[...courseIdsToSync].map((id) => syncCourseStudents(id))
    ]);

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

    await Promise.all([
      syncStudentCourses(removed.studentId),
      syncCourseStudents(removed.courseId)
    ]);
    return res.json({ ok: true });
  })
);

module.exports = router;
