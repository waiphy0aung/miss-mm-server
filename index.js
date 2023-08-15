import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import path from 'path'
import http from "node:http"
import dotenv from 'dotenv'
import morgan from 'morgan'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.route.js'
import categoryRoutes from './routes/category.route.js'
import missRoutes from './routes/miss.route.js'
import voteRoutes from './routes/vote.route.js'
import { verifyToken } from './middlewares/auth.middleware.js'

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
dotenv.config()
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("common"))
app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use("/assets", express.static(path.join(__dirname, "public/assets")))
app.use(cors())

const server = http.createServer(app)

const port = process.env.port || 3002;
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("database connected")
    app.get('/',(req,res) => res.status(200).json({status: "success"}))
    app.use('/auth', authRoutes)
    app.use('/categories', verifyToken, categoryRoutes)
    app.use('/misses', verifyToken, missRoutes)
    app.use('/vote', verifyToken, voteRoutes)
  })
  .catch(err => console.log(err + " didn't connect"))
  .finally(() => server.listen(port,() => console.log("server is listening at port "+port)))
