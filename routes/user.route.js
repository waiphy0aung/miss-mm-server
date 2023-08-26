import express from 'express'
import { getUsers, destroy } from '../controllers/user.controller.js'
const router = express.Router();

router.get('/',getUsers);

router.get('/:id',getUsers);

router.delete('/delete/:id',destroy)

export default router;
