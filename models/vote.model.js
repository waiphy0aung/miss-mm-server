import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const VoteSchema = mongoose.Schema({
  userId: ObjectId,
  missId: ObjectId,
  categoryId: ObjectId
},{timestamps: true})

const Vote = mongoose.model("Vote",VoteSchema);
export default Vote;
