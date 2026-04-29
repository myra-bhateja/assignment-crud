const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDb = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedIfNeeded, syncRelationshipArrays } = require('./seed/seed');

const departmentsRoutes = require('./routes/departments');
const employeesRoutes = require('./routes/employees');
const studentsRoutes = require('./routes/students');
const coursesRoutes = require('./routes/courses');
const enrollmentsRoutes = require('./routes/enrollments');
const relationshipsRoutes = require('./routes/relationships');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/departments', departmentsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/relationships', relationshipsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const startServer = async () => {
  const port = process.env.PORT || 4000;
  const seedOnStart = process.env.SEED_ON_START === 'true';

  try {
    await connectDb();

    if (seedOnStart) {
      await seedIfNeeded();
    }

    await syncRelationshipArrays();

    app.listen(port, () => {
      console.log(`API listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
