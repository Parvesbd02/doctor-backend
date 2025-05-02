import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
  },
  image: {
    type: String,
    default:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA5uSURBVHgB7d0JchvHFcbxN+C+iaQol..." // shortened for readability
  },
  gender: { type: String, default: "" },
  dob: { type: String, default: "" },
  phone: { type: String, default: "" },
});

// Use this to avoid model overwrite issues in development environments
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
