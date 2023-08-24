import User from "../models/user.model.js"

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


