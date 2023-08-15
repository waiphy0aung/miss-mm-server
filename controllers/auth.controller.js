import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { joiValidator } from "../utilities/joi.js";
import { faker } from "@faker-js/faker";

export const register = async (req, res) => {
  try {
    const {
      name,
      profile,
      email,
      password,
    } = req.body;

    if (email) {
      const find = await User.findOne({ email });
      if (find) return res.status(500).json({
        status: 'fail',
        data: {
          "email": "Email already exit"
        }
      })
    }

    const validateSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .message("Password must have at least 8 character include one capital letter , one number and one special character"),
    })

    const { error } = joiValidator(req.body, validateSchema);
    if (error) {
      return res.status(500).json({
        status: 'fail',
        data: error
      });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      profile,
      email,
      password: passwordHash,
      profile: faker.image.avatarGitHub()
    })

    await newUser.save();

    res.status(201).json({
      status: 'success',
      data: newUser,
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      data: err.message
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validateSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })

    const { error } = joiValidator(req.body, validateSchema);
    if (error) {
      return res.status(500).json({
        status: 'fail',
        data: error
      });
    }

    let user = await User.findOne({ email: email });
    console.log(user)

    if (!user) return res.status(404).json({ data: "Email or Password invalid!", status: 'error' })

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(404).json({ data: "Email or Password invalid!", status: 'error' })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    user.password = null

    res.status(200).json({
      status: "success",
      data: {
        token: token,
        user: user,
        role: user.role
      }
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ data: err.message, status: 'error' })
  }
}

export const loginWithToken = async (req, res) => {
  try {
    let token = req.header("Authorization");

    if (!token) return res.status(403).json({ data: "Unauthenticate", status: 'error' })

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    if (!payload)
      return res.status(401).json({ status: 'error', data: 'token is wrong' });

    const user = await User.findById(payload.id,{password: 0});
    if (!user)
      return res.status(401).json({ status: 'error', data: 'token is wrong' });

    const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({status: 'success',data: {
      token: newToken,
      user: user,
      role: user.role
    }})
  } catch (err) {
    res.status(500).json({ status: 'error', data: err.message })
  }
}
