import { ObjectId } from "mongodb";
import Vote from "../models/vote.model.js"

export const vote = async (req, res) => {
  try {
    const { missId, categoryId } = req.query;
    const { id } = req.user;
    const find = await Vote.findOne({ userId: new ObjectId(id), missId: new ObjectId(missId), categoryId: new ObjectId(categoryId) });
    if (!find) await Vote.create({
      userId: new ObjectId(id),
      missId: new ObjectId(missId),
      categoryId: new ObjectId(categoryId)
    })
    else await find.deleteOne()
    return res.status(200).json({ status: 'success', data: find })
  } catch (err) {
    res.status(500).json({ status: 'error', data: err.message })
  }
}
