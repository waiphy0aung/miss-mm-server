import mongoose from "mongoose";

const CategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 5,
    max: 50
  },
  slug: {
    type: String,
    required: true
  }
},{timestamps: true})

const Category = mongoose.model("Category",CategorySchema);

export default Category;
