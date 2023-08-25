import mongoose from "mongoose";

const MissSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 5,
    max: 50
  },
  slug: String,
  image: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 16,
    max: 60
  },
  height: {
    type: Number,
    required: true,
    min: 150,
    max: 200
  },
  weight: {
    type: Number,
    required: true,
    min: 50,
    max: 100
  },
  bust: {
    type: Number,
    required: true,
    min: 10,
    max: 100
  },
  waist: {
    type: Number,
    required: true,
    min: 10,
    max: 100
  },
  hips: {
    type: Number,
    required: true,
    min: 10,
    max: 100
  },
  location: {
    type: String,
    required: true
  },
  hobby: Array
}, { timestamps: true })

const Miss = mongoose.model("Miss", MissSchema);
export default Miss;
