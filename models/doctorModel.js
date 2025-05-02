import mongoose from "mongoose";



const doctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  degree: String,
  experience: String,
  about: String,
  fees: Number,
  address: String,
  phone: { type: String, default: true },
  speciality: { type: String, required: true },
  available: {
    type: Boolean,
    default: true,
  },
  slots_booked: {
    type: Object,
    default: {}
  },
  
  image: { type: String, required: true },
  date: { type: Date, default: Date.now },
  
},{minimize:false});





const doctorModel = mongoose.model.doctor || mongoose.model('doctor',doctorSchema);


export default doctorModel;