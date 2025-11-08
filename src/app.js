import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes/index.js';

const app = express();

app.use(helmet())

app.use(cors({ origin: true }));

app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true, limit:'1mb'}));

app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

//routes
app.use('/api',router)


app.get('/helth', (req, res) => {
  res.send('Hello World!');
});

export default app;
