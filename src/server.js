import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './db/connectMongoDB.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './middleware/logger.js';
import notFoundHandler from './middleware/notFoundHandler.js';
import notesRoutes from './routes/notesRoutes.js';

dotenv.config();
const app = express();
await connectMongoDB();
app.use(logger());
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get(notesRoutes);

app.use(notFoundHandler());

app.use(errorHandler());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
