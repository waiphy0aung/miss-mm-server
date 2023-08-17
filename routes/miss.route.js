import express from 'express'
import { get, create, update, destroy } from '../controllers/miss.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js';
import { upload } from '../storage.js';
const router = express.Router();

router.get('/', get);
router.get('/:missId', get);
router.post('/create', upload.single('image'), verifyToken, create);
router.put('/update/:id', upload.single('image'), verifyToken, update);
router.delete('/delete/:id', verifyToken, destroy);

export default router;
