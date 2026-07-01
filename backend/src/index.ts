import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes';
import { errorHandler } from './middleware/error-handler';

const app = express();
const port = process.env.PORT || 4000;

app.use(cookieParser());

app.use(
    cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
        credentials: true,
    })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/api', router);

app.get('/health', (req, res) => res.status(200).send('Agent api is running!'));

app.use((req, res) => res.status(404).send('not found'));

app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
