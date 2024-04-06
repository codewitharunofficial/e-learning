import express from 'express';
import { requireSignIn } from '../MiddleWares/authMiddleware.js';
import { newEnroll } from '../Controllers/EnrollmentsController.js';

const router = express.Router();

//for new Enrrolment

router.post('/enroll/:id/:cid', requireSignIn, newEnroll);


export default router;