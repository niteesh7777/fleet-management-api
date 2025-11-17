import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

//routes
app.use('/api', router);

app.use(errorHandler);

app.get('/helth', (req, res) => {
  res.send('Hello World!');
});

export default app;
