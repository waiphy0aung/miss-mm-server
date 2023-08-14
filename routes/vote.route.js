import express from 'express'
import { vote } from '../controllers/vote.controller.js'
const router = express.Router();

router.post("/",vote);

export default router;
