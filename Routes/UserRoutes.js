import express from 'express';
import { login, otpForNewEmail, signUp, updateNewEmail, updateProfile, uploadProfiePic } from '../Controllers/UserController.js';
import { signUpValidator } from '../Validators/UserValidator.js';
import { requireSignIn } from '../MiddleWares/authMiddleware.js';
import ExpressFormidable from 'express-formidable';

const router = express.Router();



//For User Signing Up

router.post('/sign-up', signUpValidator, signUp);

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




export default router;