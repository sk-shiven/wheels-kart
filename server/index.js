import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/user_routes.js';

dotenv.config()
const app = express();
const port = process.env.port;

app.use(express.json());
app.use(cookieParser());
app.use('/user', userRoutes);

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
})

mongoose.connect(process.env.dbURL).then(() => {
    console.log('DB connected');
}).catch((error) => {
    console.error('Error in connecting to DB', error);
})