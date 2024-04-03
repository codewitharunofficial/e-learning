import express from 'express';
import { createNewCourse, uploadContent, uploadNotes } from '../Controllers/CourseController.js';
import { IsAdmin } from '../MiddleWares/authMiddleware.js';
import ExpressFormidable from 'express-formidable';


const router = express.Router();
//For creating new course

router.post('/create-course/:id', IsAdmin, ExpressFormidable(), createNewCourse);

//For Uploading Content For a Course

router.post('/upload-content/:id', IsAdmin, ExpressFormidable(), uploadContent);

//For Uploading Notes For a course

router.post('/upload-notes/:id', IsAdmin, ExpressFormidable(), uploadNotes);


export default router;