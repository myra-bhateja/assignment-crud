const connectDb = require('../config/db');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const pushToMap = (map, key, value) => {
  const keyText = String(key);
  if (!map.has(keyText)) {
    map.set(keyText, []);
  }
  map.get(keyText).push(value);
};

const syncRelationshipArrays = async () => {
  const [departments, employees, students, courses, enrollments] = await Promise.all([
    Department.find().select('_id').lean(),
    Employee.find().select('_id departmentId').lean(),
    Student.find().select('_id').lean(),
    Course.find().select('_id').lean(),
    Enrollment.find().select('studentId courseId').lean()
  ]);

  if (departments.length) {
    const employeesByDepartment = new Map();
    employees.forEach((employee) => {
      if (employee.departmentId) {
        pushToMap(employeesByDepartment, employee.departmentId, employee._id);
      }
    });

    await Promise.all(
      departments.map((department) =>
        Department.findByIdAndUpdate(department._id, {
          employees: employeesByDepartment.get(String(department._id)) || []
        })
      )
    );
  }

  if (students.length || courses.length) {
    const coursesByStudent = new Map();
    const studentsByCourse = new Map();

    enrollments.forEach((enrollment) => {
      if (enrollment.studentId && enrollment.courseId) {
        pushToMap(coursesByStudent, enrollment.studentId, enrollment.courseId);
        pushToMap(studentsByCourse, enrollment.courseId, enrollment.studentId);
      }
    });

    await Promise.all([
      ...students.map((student) =>
        Student.findByIdAndUpdate(student._id, {
          courses: coursesByStudent.get(String(student._id)) || []
        })
      ),
      ...courses.map((course) =>
        Course.findByIdAndUpdate(course._id, {
          students: studentsByCourse.get(String(course._id)) || []
        })
      )
    ]);
  }
};

const seedIfNeeded = async () => {
  const departmentCount = await Department.countDocuments();
  if (departmentCount > 0) {
    await syncRelationshipArrays();
    return { seeded: false, synced: true };
  }

  const departments = await Department.insertMany([
    { name: 'Engineering' },
    { name: 'Design' },
    { name: 'Operations' }
  ]);

  const [engineering, design, operations] = departments;

  const employees = await Employee.insertMany([
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

  const enrollments = await Enrollment.insertMany([
    { studentId: students[0]._id, courseId: courses[0]._id },
    { studentId: students[0]._id, courseId: courses[1]._id },
    { studentId: students[1]._id, courseId: courses[1]._id },
    { studentId: students[2]._id, courseId: courses[2]._id }
  ]);

  const employeesByDepartment = new Map();
  employees.forEach((employee) => {
    if (employee.departmentId) {
      pushToMap(employeesByDepartment, employee.departmentId, employee._id);
    }
  });

  await Promise.all(
    departments.map((department) =>
      Department.findByIdAndUpdate(department._id, {
        employees: employeesByDepartment.get(String(department._id)) || []
      })
    )
  );

  const coursesByStudent = new Map();
  const studentsByCourse = new Map();

  enrollments.forEach((enrollment) => {
    if (enrollment.studentId && enrollment.courseId) {
      pushToMap(coursesByStudent, enrollment.studentId, enrollment.courseId);
      pushToMap(studentsByCourse, enrollment.courseId, enrollment.studentId);
    }
  });

  await Promise.all([
    ...students.map((student) =>
      Student.findByIdAndUpdate(student._id, {
        courses: coursesByStudent.get(String(student._id)) || []
      })
    ),
    ...courses.map((course) =>
      Course.findByIdAndUpdate(course._id, {
        students: studentsByCourse.get(String(course._id)) || []
      })
    )
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

module.exports = { seedIfNeeded, syncRelationshipArrays };
