import doctorModel from "../models/doctorModel.js";


export const changeAvailability = async (req, res) => {
  try {
    const { doctorId, availability } = req.body;

    if (!doctorId || availability === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing doctorId or availability in request",
      });
    }

    // Use findByIdAndUpdate to avoid validation errors
    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { available: availability },
      { new: true } // Return updated document
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      available: updatedDoctor.available,
    });
  } catch (err) {
    console.error("Error in changeAvailability:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating availability",
    });
  }
};



// Get list of doctors (without email & password)
export const doctorsList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(['-email', '-password']);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default {doctorsList};