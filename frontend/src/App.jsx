import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiSend } from './api';

const tabs = [
  { id: 'departments', label: 'Departments' },
  { id: 'employees', label: 'Employees' },
  { id: 'students', label: 'Students' },
  { id: 'courses', label: 'Courses' },
  { id: 'enrollments', label: 'Enrollments' },
  { id: 'relationships', label: 'Relationships' }
];

const Panel = ({ title, tag, children }) => (
  <section className="panel">
    <div className="panel-header">
      <h2>{title}</h2>
      <span className="tag">{tag}</span>
    </div>
    {children}
  </section>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [deptForm, setDeptForm] = useState({ name: '' });
  const [deptEditingId, setDeptEditingId] = useState(null);

  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    title: '',
    departmentId: ''
  });
  const [employeeEditingId, setEmployeeEditingId] = useState(null);

  const [studentForm, setStudentForm] = useState({ name: '', year: '' });
  const [studentEditingId, setStudentEditingId] = useState(null);

  const [courseForm, setCourseForm] = useState({ name: '', code: '' });
  const [courseEditingId, setCourseEditingId] = useState(null);

  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    courseId: ''
  });
  const [enrollmentEditingId, setEnrollmentEditingId] = useState(null);

  const [relDepartmentId, setRelDepartmentId] = useState('');
  const [relStudentId, setRelStudentId] = useState('');
  const [relCourseId, setRelCourseId] = useState('');
  const [relEmployees, setRelEmployees] = useState([]);
  const [relCourses, setRelCourses] = useState([]);
  const [relStudents, setRelStudents] = useState([]);

  const employeeCounts = useMemo(() => {
    const counts = {};
    employees.forEach((employee) => {
      const departmentId = employee.departmentId?._id || employee.departmentId;
      if (departmentId) {
        counts[departmentId] = (counts[departmentId] || 0) + 1;
      }
    });
    return counts;
  }, [employees]);

  const refreshAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [deptData, employeeData, studentData, courseData, enrollmentData] =
        await Promise.all([
          apiGet('/departments'),
          apiGet('/employees'),
          apiGet('/students'),
          apiGet('/courses'),
          apiGet('/enrollments')
        ]);

      setDepartments(deptData);
      setEmployees(employeeData);
      setStudents(studentData);
      setCourses(courseData);
      setEnrollments(enrollmentData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (!employeeForm.departmentId && departments.length) {
      setEmployeeForm((prev) => ({ ...prev, departmentId: departments[0]._id }));
    }
  }, [departments, employeeForm.departmentId]);

  useEffect(() => {
    if (!enrollmentForm.studentId && students.length) {
      setEnrollmentForm((prev) => ({ ...prev, studentId: students[0]._id }));
    }
    if (!enrollmentForm.courseId && courses.length) {
      setEnrollmentForm((prev) => ({ ...prev, courseId: courses[0]._id }));
    }
  }, [students, courses, enrollmentForm.studentId, enrollmentForm.courseId]);

  useEffect(() => {
    if (!relDepartmentId && departments.length) {
      setRelDepartmentId(departments[0]._id);
    }
    if (!relStudentId && students.length) {
      setRelStudentId(students[0]._id);
    }
    if (!relCourseId && courses.length) {
      setRelCourseId(courses[0]._id);
    }
  }, [departments, students, courses, relDepartmentId, relStudentId, relCourseId]);

  useEffect(() => {
    const load = async () => {
      if (!relDepartmentId) {
        setRelEmployees([]);
        return;
      }
      try {
        const data = await apiGet(`/relationships/department/${relDepartmentId}/employees`);
        setRelEmployees(data);
      } catch (err) {
        setError(err.message || 'Failed to load relationships');
      }
    };

    load();
  }, [relDepartmentId]);

  useEffect(() => {
    const load = async () => {
      if (!relStudentId) {
        setRelCourses([]);
        return;
      }
      try {
        const data = await apiGet(`/relationships/student/${relStudentId}/courses`);
        setRelCourses(data);
      } catch (err) {
        setError(err.message || 'Failed to load relationships');
      }
    };

    load();
  }, [relStudentId]);

  useEffect(() => {
    const load = async () => {
      if (!relCourseId) {
        setRelStudents([]);
        return;
      }
      try {
        const data = await apiGet(`/relationships/course/${relCourseId}/students`);
        setRelStudents(data);
      } catch (err) {
        setError(err.message || 'Failed to load relationships');
      }
    };

    load();
  }, [relCourseId]);

  const runAction = async (action) => {
    setError('');
    try {
      await action();
      await refreshAll();
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  };

  const resetDeptForm = () => {
    setDeptForm({ name: '' });
    setDeptEditingId(null);
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({ name: '', title: '', departmentId: departments[0]?._id || '' });
    setEmployeeEditingId(null);
  };

  const resetStudentForm = () => {
    setStudentForm({ name: '', year: '' });
    setStudentEditingId(null);
  };

  const resetCourseForm = () => {
    setCourseForm({ name: '', code: '' });
    setCourseEditingId(null);
  };

  const resetEnrollmentForm = () => {
    setEnrollmentForm({
      studentId: students[0]?._id || '',
      courseId: courses[0]?._id || ''
    });
    setEnrollmentEditingId(null);
  };

  const submitDepartment = async (event) => {
    event.preventDefault();
    const name = deptForm.name.trim();
    if (!name) {
      return;
    }
    await runAction(async () => {
      if (deptEditingId) {
        await apiSend(`/departments/${deptEditingId}`, 'PUT', { name });
      } else {
        await apiSend('/departments', 'POST', { name });
      }
      resetDeptForm();
    });
  };

  const submitEmployee = async (event) => {
    event.preventDefault();
    const payload = {
      name: employeeForm.name.trim(),
      title: employeeForm.title.trim(),
      departmentId: employeeForm.departmentId
    };

    if (!payload.name || !payload.title || !payload.departmentId) {
      return;
    }

    await runAction(async () => {
      if (employeeEditingId) {
        await apiSend(`/employees/${employeeEditingId}`, 'PUT', payload);
      } else {
        await apiSend('/employees', 'POST', payload);
      }
      resetEmployeeForm();
    });
  };

  const submitStudent = async (event) => {
    event.preventDefault();
    const payload = {
      name: studentForm.name.trim(),
      year: Number(studentForm.year)
    };

    if (!payload.name || !payload.year) {
      return;
    }

    await runAction(async () => {
      if (studentEditingId) {
        await apiSend(`/students/${studentEditingId}`, 'PUT', payload);
      } else {
        await apiSend('/students', 'POST', payload);
      }
      resetStudentForm();
    });
  };

  const submitCourse = async (event) => {
    event.preventDefault();
    const payload = {
      name: courseForm.name.trim(),
      code: courseForm.code.trim().toUpperCase()
    };

    if (!payload.name || !payload.code) {
      return;
    }

    await runAction(async () => {
      if (courseEditingId) {
        await apiSend(`/courses/${courseEditingId}`, 'PUT', payload);
      } else {
        await apiSend('/courses', 'POST', payload);
      }
      resetCourseForm();
    });
  };

  const submitEnrollment = async (event) => {
    event.preventDefault();
    const payload = {
      studentId: enrollmentForm.studentId,
      courseId: enrollmentForm.courseId
    };

    if (!payload.studentId || !payload.courseId) {
      return;
    }

    await runAction(async () => {
      if (enrollmentEditingId) {
        await apiSend(`/enrollments/${enrollmentEditingId}`, 'PUT', payload);
      } else {
        await apiSend('/enrollments', 'POST', payload);
      }
      resetEnrollmentForm();
    });
  };

  const renderDepartments = () => (
    <Panel title="Departments" tag="One-to-many">
      <form onSubmit={submitDepartment}>
        <div className="grid">
          <input
            value={deptForm.name}
            onChange={(event) => setDeptForm({ name: event.target.value })}
            placeholder="Department name"
            aria-label="Department name"
          />
        </div>
        <div className="footer-actions">
          <button className="primary" type="submit">
            {deptEditingId ? 'Update Department' : 'Add Department'}
          </button>
          {deptEditingId ? (
            <button className="secondary" type="button" onClick={resetDeptForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {departments.length === 0 ? (
        <p className="notice">No departments yet. Add one to start.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Employees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr key={department._id}>
                <td>{department.name}</td>
                <td>{employeeCounts[department._id] || 0}</td>
                <td>
                  <div className="actions">
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => {
                        setDeptForm({ name: department.name });
                        setDeptEditingId(department._id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      type="button"
                      onClick={() =>
                        runAction(() => apiSend(`/departments/${department._id}`, 'DELETE'))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );

  const renderEmployees = () => (
    <Panel title="Employees" tag="Belongs to Department">
      {departments.length === 0 ? (
        <p className="notice">Create a department first to assign employees.</p>
      ) : null}
      <form onSubmit={submitEmployee}>
        <div className="grid">
          <input
            value={employeeForm.name}
            onChange={(event) => setEmployeeForm({ ...employeeForm, name: event.target.value })}
            placeholder="Employee name"
            aria-label="Employee name"
          />
          <input
            value={employeeForm.title}
            onChange={(event) => setEmployeeForm({ ...employeeForm, title: event.target.value })}
            placeholder="Role title"
            aria-label="Role title"
          />
          <select
            value={employeeForm.departmentId}
            onChange={(event) =>
              setEmployeeForm({ ...employeeForm, departmentId: event.target.value })
            }
            aria-label="Department"
          >
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div className="footer-actions">
          <button className="primary" type="submit">
            {employeeEditingId ? 'Update Employee' : 'Add Employee'}
          </button>
          {employeeEditingId ? (
            <button className="secondary" type="button" onClick={resetEmployeeForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {employees.length === 0 ? (
        <p className="notice">No employees yet. Add your first team member.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Title</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.name}</td>
                <td>{employee.title}</td>
                <td>{employee.departmentId?.name || 'Unassigned'}</td>
                <td>
                  <div className="actions">
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => {
                        setEmployeeForm({
                          name: employee.name,
                          title: employee.title,
                          departmentId: employee.departmentId?._id || ''
                        });
                        setEmployeeEditingId(employee._id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      type="button"
                      onClick={() =>
                        runAction(() => apiSend(`/employees/${employee._id}`, 'DELETE'))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );

  const renderStudents = () => (
    <Panel title="Students" tag="Many-to-many">
      <form onSubmit={submitStudent}>
        <div className="grid">
          <input
            value={studentForm.name}
            onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })}
            placeholder="Student name"
            aria-label="Student name"
          />
          <input
            type="number"
            min="1"
            max="6"
            value={studentForm.year}
            onChange={(event) => setStudentForm({ ...studentForm, year: event.target.value })}
            placeholder="Year"
            aria-label="Year"
          />
        </div>
        <div className="footer-actions">
          <button className="primary" type="submit">
            {studentEditingId ? 'Update Student' : 'Add Student'}
          </button>
          {studentEditingId ? (
            <button className="secondary" type="button" onClick={resetStudentForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {students.length === 0 ? (
        <p className="notice">No students yet. Add a student to enroll.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.year}</td>
                <td>
                  <div className="actions">
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => {
                        setStudentForm({ name: student.name, year: student.year });
                        setStudentEditingId(student._id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      type="button"
                      onClick={() =>
                        runAction(() => apiSend(`/students/${student._id}`, 'DELETE'))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );

  const renderCourses = () => (
    <Panel title="Courses" tag="Many-to-many">
      <form onSubmit={submitCourse}>
        <div className="grid">
          <input
            value={courseForm.name}
            onChange={(event) => setCourseForm({ ...courseForm, name: event.target.value })}
            placeholder="Course name"
            aria-label="Course name"
          />
          <input
            value={courseForm.code}
            onChange={(event) => setCourseForm({ ...courseForm, code: event.target.value })}
            placeholder="Course code"
            aria-label="Course code"
          />
        </div>
        <div className="footer-actions">
          <button className="primary" type="submit">
            {courseEditingId ? 'Update Course' : 'Add Course'}
          </button>
          {courseEditingId ? (
            <button className="secondary" type="button" onClick={resetCourseForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {courses.length === 0 ? (
        <p className="notice">No courses yet. Add a course to enroll students.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.name}</td>
                <td>{course.code}</td>
                <td>
                  <div className="actions">
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => {
                        setCourseForm({ name: course.name, code: course.code });
                        setCourseEditingId(course._id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      type="button"
                      onClick={() =>
                        runAction(() => apiSend(`/courses/${course._id}`, 'DELETE'))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );

  const renderEnrollments = () => (
    <Panel title="Enrollments" tag="Join Table">
      {students.length === 0 || courses.length === 0 ? (
        <p className="notice">Add students and courses before enrolling.</p>
      ) : null}
      <form onSubmit={submitEnrollment}>
        <div className="grid">
          <select
            value={enrollmentForm.studentId}
            onChange={(event) =>
              setEnrollmentForm({ ...enrollmentForm, studentId: event.target.value })
            }
            aria-label="Student"
          >
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>
          <select
            value={enrollmentForm.courseId}
            onChange={(event) =>
              setEnrollmentForm({ ...enrollmentForm, courseId: event.target.value })
            }
            aria-label="Course"
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="footer-actions">
          <button className="primary" type="submit">
            {enrollmentEditingId ? 'Update Enrollment' : 'Add Enrollment'}
          </button>
          {enrollmentEditingId ? (
            <button className="secondary" type="button" onClick={resetEnrollmentForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {enrollments.length === 0 ? (
        <p className="notice">No enrollments yet. Create the first link.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment._id}>
                <td>{enrollment.studentId?.name}</td>
                <td>{enrollment.courseId?.name}</td>
                <td>
                  <div className="actions">
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => {
                        setEnrollmentForm({
                          studentId: enrollment.studentId?._id || '',
                          courseId: enrollment.courseId?._id || ''
                        });
                        setEnrollmentEditingId(enrollment._id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      type="button"
                      onClick={() =>
                        runAction(() => apiSend(`/enrollments/${enrollment._id}`, 'DELETE'))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );

  const renderRelationships = () => (
    <Panel title="Relationship Viewer" tag="Explore Links">
      <div className="relationships">
        <div className="rel-card">
          <h3>Department to Employees</h3>
          <select
            value={relDepartmentId}
            onChange={(event) => setRelDepartmentId(event.target.value)}
            aria-label="Select department"
          >
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
          <ul className="rel-list">
            {relEmployees.length === 0 ? (
              <li>No employees linked yet.</li>
            ) : (
              relEmployees.map((employee) => (
                <li key={employee._id}>
                  {employee.name} - {employee.title}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rel-card">
          <h3>Student to Courses</h3>
          <select
            value={relStudentId}
            onChange={(event) => setRelStudentId(event.target.value)}
            aria-label="Select student"
          >
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>
          <ul className="rel-list">
            {relCourses.length === 0 ? (
              <li>No courses linked yet.</li>
            ) : (
              relCourses.map((course) => (
                <li key={course._id}>
                  {course.name} ({course.code})
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rel-card">
          <h3>Course to Students</h3>
          <select
            value={relCourseId}
            onChange={(event) => setRelCourseId(event.target.value)}
            aria-label="Select course"
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
          <ul className="rel-list">
            {relStudents.length === 0 ? (
              <li>No students linked yet.</li>
            ) : (
              relStudents.map((student) => (
                <li key={student._id}>
                  {student.name} (Year {student.year})
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </Panel>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'departments':
        return renderDepartments();
      case 'employees':
        return renderEmployees();
      case 'students':
        return renderStudents();
      case 'courses':
        return renderCourses();
      case 'enrollments':
        return renderEnrollments();
      case 'relationships':
        return renderRelationships();
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>MongoDB CRUD Relationships Demo</h1>
        <p>
          Explore one-to-many (Departments to Employees) and many-to-many (Students
          and Courses) with seeded data and clean CRUD flows.
        </p>
      </header>

      <nav className="nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {loading ? <p className="notice">Loading data...</p> : null}
      {error ? <p className="notice error">{error}</p> : null}

      {renderTab()}

      <div className="footer-actions">
        <button className="secondary" type="button" onClick={refreshAll}>
          Refresh data
        </button>
      </div>
    </div>
  );
};

export default App;