import jwt from "jsonwebtoken";

export const verifyToken = async (req,res,next) => {
  try{
    let token = req.header("Authorization");

    if(!token) return res.status(403).json({data: "Unauthenticate",status: 'error'})

    if(token.startsWith("Bearer ")){
      token = token.slice(7,token.length).trimLeft();
    }
    const verified = jwt.verify(token,process.env.JWT_SECRET)
    req.user = verified;
    next()
  }catch (err){
    res.status(500).json({data: err.message,status: 'error'});
  }
}

export const authorize = async (req,res,next) => {
  try{
    let token = req.header("Authorization")
    token = token.slice(7,token.length).trimLeft();
    const {role} = jwt.verify(token,process.env.JWT_SECRET);
    if(role === "admin") next()
    else return res.status(403).json({data: "Unauthorize",status: 'error'});
  }catch (err){
    res.status(500).json({data: err.message,status: 'error'});
  }
}
