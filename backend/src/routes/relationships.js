const express = require('express');
const Department = require('../models/Department');
const Student = require('../models/Student');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/department/:id/employees',
  asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id)
      .populate({
        path: 'employees',
        select: 'name title departmentId',
        options: { sort: { name: 1 } }
      })
      .lean();

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.json(department.employees || []);
  })
);

router.get(
  '/student/:id/courses',
  asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'courses',
        select: 'name code',
        options: { sort: { name: 1 } }
      })
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.json(student.courses || []);
  })
);

router.get(
  '/course/:id/students',
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'students',
        select: 'name year',
        options: { sort: { name: 1 } }
      })
      .lean();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    return res.json(course.students || []);
  })
);

module.exports = router;
