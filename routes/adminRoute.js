import express from 'express';
import { addDoctor, adminLogin, allDoctors } from '../controllers/adminController.js';
import { changeAvailability } from '../controllers/doctorController.js'; // ✅ Make sure it's a named export
import upload from '../middleware/multer.js';
import authAdmin from '../middleware/authAdmin.js';

const adminRouter = express.Router();

// Admin login
adminRouter.post('/login', adminLogin);

// Add doctor (with image upload) — only for logged-in admins
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);

// Get all doctors (admin only)
adminRouter.get('/all-doctors', authAdmin, allDoctors);

// Change availability (admin only)
adminRouter.post('/change-availability', authAdmin, changeAvailability);

export default adminRouter;
