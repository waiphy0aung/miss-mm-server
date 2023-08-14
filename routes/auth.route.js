import express from "express"
import {register,login,loginWithToken} from "../controllers/auth.controller.js"
const route = express.Router();

route.post("/register",register);

route.post("/login",login);

route.get("/login",loginWithToken);

export default route;
