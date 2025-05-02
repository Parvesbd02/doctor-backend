import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

// App config
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 4000;

// Connect to services
connectDB();
connectCloudinary();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user',userRouter)
app.use('/uploads', express.static('uploads'));


// Root Endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Start Server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
