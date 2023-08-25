import express from "express";
import Lock from "../models/lock.model.js";
import { authorize, verifyToken } from "../middlewares/auth.middleware.js";
import moment from "moment-timezone"
const router = express.Router();

router.get('/',async (req,res) => {
  try{
    const find = await Lock.find();
    if(find.length === 0 || !find) await Lock.create({isLock: true})
    const lock = await Lock.find();
    res.status(200).json({status: 'success',data: lock[0]});
  }catch(err){
    console.log(err)
    res.status(500).json({status: 'error',data: err.message})
  }
})

router.post('/',verifyToken ,authorize,async (req,res) => {
  try{
    let lock = await Lock.find();
    if(lock.length === 0) await Lock.create({isLock: false});
    lock = await Lock.find();
    let result = await Lock.findByIdAndUpdate(lock[0]._id,{
      isLock: !lock[0].isLock
    })
    res.status(200).json({status: 'success',data: result})
  }catch (err){
    console.log(err);
    res.status(500).json({status: 'error',data: err.message});
  }
})

router.post('/result',verifyToken, authorize,async(req,res) => {
  try{
    let find = await Lock.find();
    console.log(find[0])
    let result = await Lock.findByIdAndUpdate(find[0]._id,{
      result: !find[0].result
    })
    res.status(200).json({status: 'success',data: result})
  }catch(err){
    console.log(err)
    res.status(500).json({status: 'error',data:err.message})
  }
})

router.post('/voting-time',verifyToken ,authorize,async(req,res) => {
  try{
    const {hours,minutes} = req.body;
    const newDate = moment().tz('Asia/Yangon').add(hours,'hours').add(minutes,'minutes').toDate();
    const find = await Lock.find();
    let result = await Lock.findByIdAndUpdate(find[0]._id,{
      votingTime: newDate
    })
    res.status(200).json({status: 'success',data: result})
  }catch (err){
    console.log(err);
    res.status(500).json({status: 'error',data:err.message})
  }
})

export default router;
