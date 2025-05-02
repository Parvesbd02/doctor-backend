import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";

// Cloudinary config (make sure your .env file is set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const addDoctor = async (req, res) => {
  try {
    const {
      name, email, password, degree, experience,
      about, fees, address, phone, speciality
    } = req.body;

    const imageFile = req.file;

    // Validation
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!degree) missingFields.push("degree");
    if (!experience) missingFields.push("experience");
    if (!about) missingFields.push("about");
    if (!fees) missingFields.push("fees");
    if (!address) missingFields.push("address");
    if (!phone) missingFields.push("phone");
    if (!speciality) missingFields.push("speciality");
    if (!imageFile) missingFields.push("image");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing fields: ${missingFields.join(", ")}`,
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long with an uppercase letter, number, and symbol.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload image
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const newDoctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      degree,
      experience,
      about,
      fees,
      address,
      phone,
      speciality,
      image: imageUpload.secure_url,
      date: Date.now(),
    });

    await newDoctor.save();

    return res.status(201).json({ success: true, message: "Doctor added successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

      return res.json({
        success: true,
        message: "Admin logged in successfully",
        token,
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addDoctor, adminLogin, allDoctors };
