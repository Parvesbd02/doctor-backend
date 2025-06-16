import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import razorpay from 'razorpay'


// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure uploads/ folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" }); // Prevent user enumeration
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Respond with token and user info (optional)
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE PROFILE

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, dob, gender } = req.body;

    const updatedFields = {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    };

    // Handle uploaded image correctly
    if (req.file) {
      updatedFields.image = req.file.path.replace("\\", "/");
    }

    const user = await userModel.findByIdAndUpdate(userId, updatedFields, { new: true });

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//API TO BOOK APPOINTMENT
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user?.id; // Get user ID from the token middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user ID' });
    }

    // Step 1: Fetch doctor data
    const docData = await doctorModel.findById(docId).lean();
    if (!docData) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (!docData.available) {
      return res.status(400).json({ success: false, message: 'Doctor not available' });
    }

    // Step 2: Check if slot is already booked
    const isSlotBooked =
      docData.slots_booked?.[slotDate]?.includes(slotTime);

    if (isSlotBooked) {
      return res.status(400).json({ success: false, message: 'Slot not available' });
    }

    // Step 3: Update booked slot
    if (docData.slots_booked[slotDate]) {
      docData.slots_booked[slotDate].push(slotTime);
    } else {
      docData.slots_booked[slotDate] = [slotTime];
    }

    await doctorModel.findByIdAndUpdate(docId, {
      slots_booked: docData.slots_booked,
    });

    // Step 4: Get user data
    const userData = await userModel.findById(userId).select('-password').lean();
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Step 5: Create appointment
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotDate,
      slotTime,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    res.json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




//api to get user appoinment for frontend my-appointment page






const listAppointment = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

    // If token is not provided, return Unauthorized response
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized, no token provided" });
    }

    // Verify the token and extract the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key for verification
    const userId = decoded.id; // The id field should match what is stored in your token

    // Find appointments only for the authenticated user
    const appointments = await appointmentModel.find({ userId });

    // If no appointments are found for this user
    if (appointments.length === 0) {
      return res.status(200).json({ success: true, appointments: [] });
    }

    // Return appointments specific to the authenticated user
    res.status(200).json({ success: true, appointments });

  } catch (error) {
    console.error(error);

    // Handle specific errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    // Generic server error
    res.status(500).json({ success: false, message: "Server error" });
  }
};









//API TO CANCEL APPOINTMENT

const cancelAppointment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { appointmentId } = req.body;

    // Find appointment and ensure it belongs to the user
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    // Update the appointment status
    appointment.cancelled = true;
    await appointment.save();

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const razorpayInstant = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

//API FOR ONLINE PAYMENT 
const paymentRazorpay = async(req,res) =>{
  
}









export { registerUser, loginUser, getProfile, updateUserProfile, upload,bookAppointment,listAppointment,cancelAppointment };


