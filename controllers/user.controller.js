import { ObjectId } from "mongodb";
import User from "../models/user.model.js"
import Vote from "../models/vote.model.js";

export const getUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await User.aggregate([
      {
        $match: id ? {
          "_id": new ObjectId(id)
        } : {}
      },
      {
        '$lookup': {
          'from': 'votes',
          'let': {
            'userId': '$_id'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$userId', '$$userId'
                  ]
                }
              }
            }
          ],
          'as': 'votes'
        }
      }
    ])
    res.status(200).json({ status: 'success', data: users })
  } catch (err) {
    console.log(err)
    res.status(500).json({ status: 'error', data: err.message })
  }
}

export const destroy = async (req,res) => {
  try{
    const {id} = req.params;
    const find = await User.findById(id);
    if(!find) return res.status(404).json({status: 'error',data: 'User not found'})
    await Vote.deleteMany({userId: new ObjectId(id)})
    await User.findByIdAndDelete(id);
    res.status(200).json({status: 'success',data: id})
  }catch (err){
    console.log(err);
    res.status(500).json({status: 'error',data: err.message})
  }
}


