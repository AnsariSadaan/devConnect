import express from 'express';
import cors from 'cors';
import userRouter from './routes/auth.routes.js';
import userProfileRouter from './routes/profile.routes.js';
import userFeedRouter from './routes/user.routes.js';
import paymentRouter from './routes/payment.routes.js';
import requestSendReceiveRouter from './routes/request.routes.js';
import chatRouter from './routes/chat.routes.js';
import cookieParser from 'cookie-parser';
import './utils/Cronjob.js';
import http from 'http';
import initializeSocket from './config/socketConnection.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "*"],
    credentials: true,
}));


app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));


app.use('/api', userRouter);
app.use('/api', userProfileRouter);
app.use('/api', userFeedRouter);
app.use('/api', requestSendReceiveRouter);
app.use('/api', paymentRouter);
app.use('/api', chatRouter);

export const server = http.createServer(app);
initializeSocket(server);

// Global Error Handler
app.use(errorHandler);

export default app;