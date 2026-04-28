const express = require('express');
const Employee = require('../models/Employee');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/department/:id/employees',
  asyncHandler(async (req, res) => {
    const employees = await Employee.find({ departmentId: req.params.id })
      .populate('departmentId', 'name')
      .sort({ name: 1 })
      .lean();
    res.json(employees);
  })
);

router.get(
  '/student/:id/courses',
  asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ studentId: req.params.id })
      .populate('courseId', 'name code')
      .lean();
    const courses = enrollments.map((enrollment) => enrollment.courseId);
    res.json(courses);
  })
);

router.get(
  '/course/:id/students',
  asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ courseId: req.params.id })
      .populate('studentId', 'name year')
      .lean();
    const students = enrollments.map((enrollment) => enrollment.studentId);
    res.json(students);
  })
);

module.exports = router;
