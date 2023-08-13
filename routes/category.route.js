import express from "express"
import { get,create,update,destroy } from "../controllers/category.controller.js"
import { authorize } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get('/',get);

router.post('/create',authorize,create);

router.put('/update/:id',authorize,update);

router.delete('/delete/:id',authorize,destroy);

export default router
