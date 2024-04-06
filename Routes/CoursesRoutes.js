import express from "express";
import {
  createNewCourse,
  deleteAContent,
  deleteAllCourses,
  deleteCourse,
  deleteNotes,
  getACourse,
  getCourseUsingFilters,
  getCourses,
  searchCourse,
  updateCourse,
  updateCover,
  uploadContent,
  uploadNotes,
} from "../Controllers/CourseController.js";
import { IsAdmin } from "../MiddleWares/authMiddleware.js";
import ExpressFormidable from "express-formidable";

const router = express.Router();

//Notes: (1) Addtional security can be provided by using another middleware requireSignIn in admin controlled routes.
//(2) Routes with IsAdmin Middleware have id in params that id refers to user id to identify whether the user is admin or not. And cid refers to course id.

//For creating new course

router.post(
  "/create-course/:id",
  IsAdmin,
  ExpressFormidable(),
  createNewCourse
);

//For Uploading Content For a Course

router.post(
  "/upload-content/:id/:cid",
  IsAdmin,
  ExpressFormidable(),
  uploadContent
);

//For Uploading Notes For a course

router.post(
  "/upload-notes/:id/:cid",
  IsAdmin,
  ExpressFormidable(),
  uploadNotes
);

//for Deleting a content from a course

router.delete("/delete-content/:id", IsAdmin, deleteAContent);

//For Deleting notes from a course

router.delete("/delete-notes/:id", IsAdmin, deleteNotes);

//For Delete A Course

router.delete("/delete-course/:id/:cid", IsAdmin, deleteCourse);

//for deleting all courses

router.delete("/delete-courses/:id", IsAdmin, deleteAllCourses);

//for updating a course

router.post("/update-course/:id/:cid", IsAdmin, updateCourse);

//For Fetching all available courses, here page in params is the page no.

router.get("/fetch-courses/:page", getCourses);

//for fetching a course

router.get("/get-course/:id", getACourse);

//get courses by filters
//multiple params can be passed here like filters?level=Advance&popularity=5 will return all the courses which either have Advance level & populariy of 5.

router.get("/filters", getCourseUsingFilters);

//for updating a course's cover photo

router.post(
  "/update-cover/:id/:cid",
  IsAdmin,
  ExpressFormidable(),
  updateCover
);

//search courses

router.get("/search/:keyword/:page", searchCourse);

export default router;
