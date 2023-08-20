import mongoose from "mongoose";

const LockSchema = mongoose.Schema({
  isLock: {
    type: Boolean,
    default: false,
    required: true
  }
})

const Lock = mongoose.model("Lock",LockSchema);
export default Lock;
