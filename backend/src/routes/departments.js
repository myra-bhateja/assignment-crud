const express = require('express');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const departments = await Department.find().sort({ name: 1 }).lean();
    res.json(departments);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const department = await Department.create({ name: req.body.name });
    res.status(201).json(department);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const department = await Department.findById(req.params.id).lean();
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    return res.json(department);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const departmentId = req.params.id;
    await Employee.deleteMany({ departmentId });
    const removed = await Department.findByIdAndDelete(departmentId).lean();

    if (!removed) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.json({ ok: true });
  })
);

module.exports = router;
