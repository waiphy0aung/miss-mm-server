import Miss from "../models/miss.model.js";
import Joi from "joi";
import { joiValidator } from "../utilities/joi.js";
import slugify from "../utilities/slugify.js";
import { storage } from '../firebase.js'
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage'
import { faker } from "@faker-js/faker"
import urlToPath from "../utilities/urlToPath.js";
import Vote from "../models/vote.model.js";
import { ObjectId } from "mongodb";

export const get = async (req, res) => {
  try {
    const { id } = req.user;
    let misses = await Miss.aggregate([
      {
        '$lookup': {
          'from': 'votes',
          'let': {
            'missId': '$_id'
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$missId', '$$missId'
                  ]
                }
              }
            }, {
              '$count': 'count'
            }
          ],
          'as': 'voteCount'
        }
      }, {
        '$lookup': {
          'from': 'votes',
          'let': {
            'missId': '$_id',
            'userId': new ObjectId('64d87a9866e3efbfaac71995')
          },
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$userId', '$$userId'
                  ],
                  '$eq': [
                    '$missId', '$$missId'
                  ]
                }
              }
            }, {
              '$count': 'count'
            }, {
              '$project': {
                'is_vote': {
                  '$cond': [
                    {
                      '$gte': [
                        '$count', 0
                      ]
                    }, true, false
                  ]
                }
              }
            }
          ],
          'as': 'isVote'
        }
      }, {
        '$unwind': {
          'path': '$voteCount',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$unwind': {
          'path': '$isVote',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$replaceWith': {
          '$setField': {
            'field': 'voteCount',
            'input': '$$ROOT',
            'value': {
              '$ifNull': [
                '$voteCount.count', 0
              ]
            }
          }
        }
      }, {
        '$replaceWith': {
          '$setField': {
            'field': 'isVote',
            'input': '$$ROOT',
            'value': {
              '$ifNull': [
                '$isVote.is_vote', false
              ]
            }
          }
        }
      }
    ]);
    res.status(200).json({
      status: 'success',
      data: misses
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      data: err.message
    })
  }
}

export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const miss = await Miss.findById(id)
    if (!miss) return res.status(404).json({ status: 'error', data: 'Miss not found' })
    res.status(200).json({
      status: 'success',
      data: miss
    })
  } catch (err) {
    res.status(500).json({ status: 'error', data: err.message })
  }
}

export const create = async (req, res) => {
  try {
    const {
      name,
      age,
      height,
      weight,
      location,
      hobby
    } = JSON.parse(req.body.data);
    const find = await Miss.findOne({ name });
    if (find) throw new Error(name + ' already exit')
    const validateSchema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      age: Joi.number().min(15).max(60).required(),
      height: Joi.number().min(150).max(200).required(),
      weight: Joi.number().min(50).max(100).required(),
      location: Joi.string().required(),
      hobby: Joi.array().items(Joi.string())
    })
    const { error } = joiValidator(JSON.parse(req.body.data), validateSchema);
    if (error) return res.status(500).json({ status: 'fail', data: error })

    let image = faker.image.avatarGitHub();
    if (req.file) {
      const fileName = Math.random().toString(36).substring(2) + "_" + req.file.originalname;
      const storageRef = ref(storage, "miss/" + fileName);
      await uploadBytes(storageRef, req.file.buffer);
      image = await getDownloadURL(storageRef);
    }

    const miss = await Miss.create({
      name,
      slug: slugify(name),
      image,
      age,
      height,
      weight,
      location,
      hobby
    })
    res.status(201).json({
      status: 'success',
      data: miss
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      data: err.message
    })
  }
}

export const update = async (req, res) => {
  try {
    const {
      name,
      image,
      age,
      height,
      weight,
      location,
      hobby
    } = JSON.parse(req.body.data);
    const { id } = req.params

    const find = await Miss.findById(id);
    if (!find) return res.status(500).json({ status: 'error', data: 'Miss not found' })
    const validateSchema = Joi.object({
      name: Joi.string().min(5).max(50).required(),
      image: Joi.string().required(),
      age: Joi.number().min(15).max(60).required(),
      height: Joi.number().min(150).max(200).required(),
      weight: Joi.number().min(50).max(100).required(),
      location: Joi.string().required(),
      hobby: Joi.array().items(Joi.string())
    })
    const { error } = joiValidator(JSON.parse(req.body.data), validateSchema);
    if (error) return res.status(500).json({ status: 'fail', data: error })

    if (req.file) {
      const fileName = Math.random().toString(36).substring(2) + "_" + req.file.originalname;
      const storageRef = ref(storage, "miss/" + fileName);
      await uploadBytes(storageRef, req.file.buffer);
      await deleteObject(ref(storage, urlToPath(image)))
      image = await getDownloadURL(storageRef);
    }

    const miss = await Miss.findByIdAndUpdate(id, {
      name,
      slug: slugify(name),
      image,
      age,
      height,
      weight,
      location,
      hobby
    })
    res.status(201).json({
      status: 'success',
      data: miss
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      data: err.message
    })
  }
}

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const miss = await Miss.findById(id);
    if (!miss) return res.status(500).json({ status: 'error', data: 'Miss not found' })
    await Vote.deleteMany({ missId: new ObjectId(id) })
    await Miss.findByIdAndDelete(id)
    if (miss.image.includes("firebase")) await deleteObject(ref(storage, urlToPath(miss.image)))
    res.status(200).json({ status: 'success', data: id })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      data: err.message
    })
  }
}
