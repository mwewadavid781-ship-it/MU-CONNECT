import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(cors({
origin(origin, callback) {
if (!origin || env.allowedOrigins.length === 0 ||
env.allowedOrigins.includes(origin)) {
return callback(null, true);
}

return callback(new Error('Origin not allowed by CORS'));

}
}));

app.use(express.json({ limit: '1mb' }));

app.use(rateLimit({
windowMs: 15 * 60 * 1000,
limit: 100,
standardHeaders: 'draft-7',
legacyHeaders: false
}));

app.get('/api/health', (_req, res) => {
res.json({
status: 'ok',
app: 'MUCONNECT',
environment: env.nodeEnv
});
});

app.use(express.static('public'));

app.use((_req, res) => {
res.status(404).json({ error: 'Route not found' });
});

app.listen(env.port, () => {
console.log("MUCONNECT server running on port ${env.port}");
});
