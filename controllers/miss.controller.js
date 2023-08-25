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
    const { missId } = req.params;
    const { id } = req.user;
    let misses = await Miss.aggregate([
      {
        "$match": missId ? {
          "_id": new ObjectId(missId)
        } : {}
      },
      {
        $lookup: {
          from: "votes",
          let: {
            missId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$missId", "$$missId"],
                },
              },
            },
            {
              $group: {
                _id: "$categoryId",
                count: {
                  $count: {},
                },
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "name",
              },
            },
            {
              $unwind: "$name",
            },
            {
              $project: {
                k: "$name.slug",
                v: "$count",
                _id: 0,
              },
            },
          ],
          as: "voteCount",
        },
      },
      {
        $lookup: {
          from: "votes",
          let: {
            missId: "$_id",
            userId: new ObjectId(id),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$missId", "$$missId"],
                },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$userId"],
                },
              },
            },
            {
              $group: {
                _id: "$categoryId",
                count: {
                  $count: {},
                },
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "name",
              },
            },
            {
              $unwind: "$name",
            },
            {
              $project: {
                _id: 0,
                k: "$name.slug",
                v: {
                  $cond: [
                    {
                      $gte: ["$count", 0],
                    },
                    true,
                    false,
                  ],
                },
              },
            },
          ],
          as: "isVote",
        },
      },
      {
        $replaceWith: {
          $setField: {
            field: "voteCount",
            input: "$$ROOT",
            value: {
              $ifNull: [
                {
                  $arrayToObject: "$voteCount",
                },
                {},
              ],
            },
          },
        },
      },
      {
        $replaceWith: {
          $setField: {
            field: "isVote",
            input: "$$ROOT",
            value: {
              $ifNull: [
                {
                  $arrayToObject: "$isVote",
                },
                {},
              ],
            },
          },
        },
      }
    ]);
    if (missId && misses.length === 0) return res.status(404).json({ status: 'error', data: 'Miss not found' });
    res.status(200).json({
      status: 'success',
      data: missId ? misses[0] : misses
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      data: err.message
    })
  }
}

export const create = async (req, res) => {
  try {
    const {
      name,
      age,
      height,
      weight,
      bust,
      waist,
      hips,
      location,
      hobby
    } = JSON.parse(req.body.data);
    const find = await Miss.findOne({ name });
    if (find) throw new Error(name + ' already exit')
    const validateSchema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      age: Joi.number().min(15).max(60).required(),
      height: Joi.number().min(150).max(200).required(),
      weight: Joi.number().min(40).max(100).required(),
      bust: Joi.number().min(10).max(100).required(),
      waist: Joi.number().min(10).max(100).required(),
      hips: Joi.number().min(10).max(100).required(),
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
      bust,
      waist,
      hips,
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
      bust,
      waist,
      hips,
      location,
      hobby
    } = JSON.parse(req.body.data);
    const { id } = req.params

    const find = await Miss.findById(id);
    if (!find) return res.status(500).json({ status: 'error', data: 'Miss not found' })
    const validateSchema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      image: Joi.string().required(),
      age: Joi.number().min(15).max(60).required(),
      height: Joi.number().min(150).max(200).required(),
      weight: Joi.number().min(40).max(100).required(),
      bust: Joi.number().min(10).max(100).required(),
      waist: Joi.number().min(10).max(100).required(),
      hips: Joi.number().min(10).max(100).required(),
      location: Joi.string().required(),
      hobby: Joi.array().items(Joi.string())
    }).unknown(true)
    const { error } = joiValidator(JSON.parse(req.body.data), validateSchema);
    if (error) return res.status(500).json({ status: 'fail', data: error })

    let newImage = image;

    if (req.file) {
      const fileName = Math.random().toString(36).substring(2) + "_" + req.file.originalname;
      const storageRef = ref(storage, "miss/" + fileName);
      await uploadBytes(storageRef, req.file.buffer);
      await deleteObject(ref(storage, urlToPath(image)))
      newImage = await getDownloadURL(storageRef);
    }

    const miss = await Miss.findByIdAndUpdate(id, {
      name,
      slug: slugify(name),
      image: newImage,
      age,
      height,
      weight,
      bust,
      waist,
      hips,
      location,
      hobby
    })
    const updatedMiss = await Miss.findById(id);
    res.status(201).json({
      status: 'success',
      data: updatedMiss
    })
  } catch (err) {
    console.log(err)
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
