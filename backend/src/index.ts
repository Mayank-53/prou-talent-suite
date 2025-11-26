import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { UPLOADS_DIR } from './middleware/uploadMiddleware';
import { connectDB } from './config/db';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import taskRoutes from './routes/taskRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import submissionRoutes from './routes/submissionRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';
import { seedData } from './seed/seedData';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Serve uploaded files statically (for development without Cloudinary)
app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/health', (_req, res) => res.json({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
  mongodb: 'Check /api/employees to test DB connection'
}));
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);

if (env.nodeEnv === 'production') {
  const clientPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(clientPath));
  app.get('*', (_req, res) => res.sendFile(path.join(clientPath, 'index.html')));
}

app.use(errorHandler);

const start = async () => {
  await connectDB();
  await seedData();
  app.listen(env.port, () => {
    console.log(`🚀 API ready at http://localhost:${env.port}`);
  });
};

start();

