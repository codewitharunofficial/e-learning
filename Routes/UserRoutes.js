import express from 'express';
import { deleteAccount, deleteAccountReq, login, otpForNewEmail, resetPasswordReq, signUp, updateNewEmail, updateProfile, uploadProfiePic, verifyAndReset, verifyOTP } from '../Controllers/UserController.js';
import { ForgotPasswordValidator, signUpValidator } from '../Validators/UserValidator.js';
import { requireSignIn } from '../MiddleWares/authMiddleware.js';
import ExpressFormidable from 'express-formidable';
import { generateNewOTP } from '../Validators/OTPValidator.js';

const router = express.Router();



//For User Signing Up

router.post('/sign-up', signUpValidator, signUp);

//For Verifying email otp to finish signing up

router.post('/verify-email', requireSignIn,  verifyOTP);

// for generating new otp for email verification on signing up later

router.post('/generate-new-otp/:id', requireSignIn, generateNewOTP);

//For User Login

router.post('/login', login);

//For Updating User

router.post('/update-user/:id', requireSignIn, updateProfile);

//For sending otp on new email

router.post('/email-otp/:id', requireSignIn, otpForNewEmail);

//For verifying otp & updating new email

router.post('/update-email/:id', requireSignIn, updateNewEmail);

//For uploading profile pic

router.post('/upload-profile-photo/:id', requireSignIn, ExpressFormidable(), uploadProfiePic );

//request for deleting account

router.post("/request-delete-user/:id", deleteAccountReq);

//verify otp to delete account

router.delete('/delete-user/:id', deleteAccount );

//reset password request

router.post("/reset-password-request/:id", resetPasswordReq);

//verify otp and reset password

router.put("/reset/:id", ForgotPasswordValidator, verifyAndReset);

export default router;