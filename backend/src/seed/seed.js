const connectDb = require('../config/db');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const seedIfNeeded = async () => {
  const departmentCount = await Department.countDocuments();
  if (departmentCount > 0) {
    return { seeded: false };
  }

  const departments = await Department.insertMany([
    { name: 'Engineering' },
    { name: 'Design' },
    { name: 'Operations' }
  ]);

  const [engineering, design, operations] = departments;

  await Employee.insertMany([
    { name: 'Aanya Rao', title: 'Frontend Engineer', departmentId: engineering._id },
    { name: 'Kabir Singh', title: 'Backend Engineer', departmentId: engineering._id },
    { name: 'Meera Joshi', title: 'Product Designer', departmentId: design._id },
    { name: 'Rohit Mehta', title: 'Ops Lead', departmentId: operations._id }
  ]);

  const students = await Student.insertMany([
    { name: 'Arjun Patel', year: 2 },
    { name: 'Maya Nair', year: 3 },
    { name: 'Lina Kapoor', year: 1 }
  ]);

  const courses = await Course.insertMany([
    { name: 'Database Basics', code: 'DB101' },
    { name: 'Web Development', code: 'WEB201' },
    { name: 'Cloud Fundamentals', code: 'CLD150' }
  ]);

  await Enrollment.insertMany([
    { studentId: students[0]._id, courseId: courses[0]._id },
    { studentId: students[0]._id, courseId: courses[1]._id },
    { studentId: students[1]._id, courseId: courses[1]._id },
    { studentId: students[2]._id, courseId: courses[2]._id }
  ]);

  return { seeded: true };
};

const runSeed = async () => {
  await connectDb();
  const result = await seedIfNeeded();
  if (result.seeded) {
    console.log('Seeded demo data.');
  } else {
    console.log('Seed skipped. Existing data found.');
  }
  process.exit(0);
};

if (require.main === module) {
  runSeed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedIfNeeded };
