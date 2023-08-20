import express from "express";
import Lock from "../models/lock.model.js";
import { authorize } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get('/',authorize,async (req,res) => {
  try{
    const find = await Lock.find();
    if(find.length === 0 || !find) await Lock.create({isLock: true})
    const lock = await Lock.find();
    res.status(200).json({status: 'success',data: lock[0]?.isLock});
  }catch(err){
    console.log(err)
    res.status(500).json({status: 'error',data: err.message})
  }
})

router.post('/',authorize,async (req,res) => {
  try{
    let lock = await Lock.find();
    if(lock.length === 0) await Lock.create({isLock: false});
    lock = await Lock.find();
    const result = await Lock.findByIdAndUpdate(lock[0]._id,{
      isLock: !lock[0].isLock
    })
    res.status(200).json({status: 'success',data: result?.isLock})
  }catch (err){
    console.log(err);
    res.status(500).json({status: 'error',data: err.message});
  }
})

export default router;
