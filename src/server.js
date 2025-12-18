import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import { connectMongoDB } from './db/connectMongoDB.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import authRoutes from './routes/authRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
await connectMongoDB();
app.use(logger);
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

app.use(authRoutes);
app.use(notesRoutes);

app.use(notFoundHandler);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
