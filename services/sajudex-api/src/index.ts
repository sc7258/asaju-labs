import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import publicRoutes from './routes/public';
import privateRoutes from './routes/private';
import { requireApiKey } from './middleware/auth';
import { publicApiLimiter, privateApiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Key Validation (전역 적용)
app.use(requireApiKey);

// Routes
// Myeongsik-rok (Public Data) - 엄격한 Rate Limit 적용
app.use('/api/v1/public', publicApiLimiter, publicRoutes);

// Inyeon-rok (Private Data) - 여유있는 Rate Limit 적용
app.use('/api/v1/private', privateApiLimiter, privateRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(\Sajudex API Server is running on port \\);
});
