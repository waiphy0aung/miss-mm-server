import Category from "../models/category.model.js";
import Joi from "joi";
import { joiValidator } from "../utilities/joi.js";
import slugify from "../utilities/slugify.js";
import { ObjectId } from "mongodb";

export const get = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      status: 'success',
      data: categories
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
    const { name } = req.body;
    console.log(name)
    const find = await Category.findOne({ name })
    if (find) return res.status(500).json({
      status: 'error',
      data: name + ' already exit'
    })
    const schema = Joi.object({
      name: Joi.string().min(3).max(20).required()
    })
    const { error } = joiValidator(req.body, schema)
    if (error) return res.status(500).json({
      status: 'fail',
      data: error
    })
    const category = await Category.create({
      name,
      slug: slugify(name)
    })

    res.status(201).json({
      status: 'success',
      data: category
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
    const { name } = req.body;
    const { id } = req.params;
    console.log(id)
    const find = await Category.findById(id);
    if (!find) return res.status(404).json({
      status: 'error',
      data: 'Category not found'
    })
    const schema = Joi.object({
      name: Joi.string().min(3).max(20)
    })
    const { error } = joiValidator(req.body, schema)
    if (error) return res.status(500).json({
      status: 'fail',
      data: error
    })
    await Category.findByIdAndUpdate(id, {
      name,
      slug: slugify(name)
    })
    const category = await Category.findById(id)

    res.status(201).json({
      status: 'success',
      data: category
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
    const { id } = req.params
    const find = await Category.findById(id);
    if (!find) return res.status(404).json({
      status: 'error',
      data: 'Category not found'
    })
    await Category.findByIdAndDelete(id)
    res.status(200).json({
      status: 'success',
      data: id
    })
  } catch (err) {
    res.status(500).json({
      status: "error",
      data: err.message
    })
  }
}


