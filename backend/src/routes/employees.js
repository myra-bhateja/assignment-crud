const express = require('express');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const syncDepartmentEmployees = async (departmentId) => {
  if (!departmentId) {
    return;
  }

  const employees = await Employee.find({ departmentId }).select('_id').lean();
  const employeeIds = employees.map((employee) => employee._id);
  await Department.findByIdAndUpdate(departmentId, { employees: employeeIds });
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const employees = await Employee.find()
      .populate('departmentId', 'name')
      .sort({ name: 1 })
      .lean();
    res.json(employees);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, title, departmentId } = req.body;
    const department = await Department.findById(departmentId).lean();
    if (!department) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    const employee = await Employee.create({ name, title, departmentId });
    await syncDepartmentEmployees(departmentId);
    res.status(201).json(employee);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, title, departmentId } = req.body;
    const existing = await Employee.findById(req.params.id).lean();
    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const department = await Department.findById(departmentId).lean();
    if (!department) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, title, departmentId },
      { new: true, runValidators: true }
    ).lean();

    const departmentsToSync = new Set([
      String(existing.departmentId),
      String(departmentId)
    ]);
    await Promise.all([...departmentsToSync].map((id) => syncDepartmentEmployees(id)));

    return res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const removed = await Employee.findByIdAndDelete(req.params.id).lean();
    if (!removed) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await syncDepartmentEmployees(removed.departmentId);
    return res.json({ ok: true });
  })
);

module.exports = router;
