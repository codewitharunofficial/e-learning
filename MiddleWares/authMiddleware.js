import JWT from 'jsonwebtoken';
import UserModel from '../Models/UserModel.js';

// Token Based Protected Route

export const requireSignIn = (req, res, next) => {
      try {
        const decode = JWT.verify(req.headers.authorization, process.env.JWT_SECRET);
        req.user = decode;
        next();
      } catch (error) {
        console.log(error)
        return res.status(401).send({
          success: false,
          message:"Error in Validation",
          error
        })
      }
};

export const IsAdmin = async (req, res, next) =>{
  const {id} = req.params;
try {
  const user = await UserModel.findById({_id: id});

  if(user.role === 'Admin'){
    next();
  } else{
    return res.status(401).send({
      success: true,
      message: "Unauthorized Access"
    });
  }
  
} catch (error) {
  console.log(error)
  return res.status(401).send({
    success: false,
    message: "Error in admin MiddleWare",
    error
  })
}
}