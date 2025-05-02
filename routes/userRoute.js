import express from 'express';
import { registerUser, loginUser, getProfile, updateUserProfile,bookAppointment, listAppointment, cancelAppointment } from '../controllers/userController.js';
import authUser from '../middleware/authUser.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post("/update-profile", authUser,upload.single('image'), updateUserProfile);
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.post('/appointments', listAppointment);
userRouter.post('/cancel-appointment',authUser,cancelAppointment)

export default userRouter;





