import bcrypt from 'bcrypt';
import { body } from "express-validator";

export const hashPassword = async (password) => {
   try {
    const saltRounds = 10;
     const hashedPassword = await bcrypt.hash(password, saltRounds);
     return hashedPassword;
   } catch (error) {
    console.log(error);
   }
}

export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  };


export const signUpValidator = [
    body('email', "Invalid Email").isEmail(),
    body('password', "Password Should be of atleast 6 characters & a combination of upper, lowercase numbers & symbols").isLength({min: 6}).isStrongPassword({minLowercase: 1, minSymbols: 1, minUppercase: 1, minNumbers: 1}),
    body('phone', "Invalid Phone No.").isMobilePhone('en-IN').isLength({min: 13})
]

export const ForgotPasswordValidator = [
    body('password', "Password Should be of atleast 6 characters & a combination of upper, lowercase numbers & symbols").isLength({min: 6}).isStrongPassword({minLowercase: 1, minSymbols: 1, minUppercase: 1, minNumbers: 1}),
]