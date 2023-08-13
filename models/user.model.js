import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true
  },
  profile: String,
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "user"
  }
},{timestamps: true})

const User = mongoose.model("User",UserSchema)
export default User;
