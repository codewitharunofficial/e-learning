import cloudinary from "../Config/cloudinray.js";
import ContentModel from "../Models/ContentModel.js";
import CourseModel from "../Models/CourseModel.js";
import NotesModel from "../Models/NotesModel.js";

//for new course creation
export const createNewCourse = async (req, res) => {
  try {
    const { name, category, duration, price } = req.fields;
    const { photo } = req.files;
    switch (true) {
      case !name:
        throw new Error("Name is Required");
      case !category:
        throw new Error("Category Name is Required");
      case !duration:
        throw new Error("Course Duration is Required");
      case !price:
        throw new Error("Course Price is Required");
    }

    const coverPhoto = await cloudinary.uploader.upload(photo.path, {
      public_id: `${name}_content_cover`,
      resource_type: "image",
      folder: "Course Cover",
    });

    const newCourse = await new CourseModel({
      name: name,
      category: category,
      duration: duration,
      price: price,
      coverPhoto: coverPhoto,
    });
    await newCourse.save();
    res.status(200).send({
      success: true,
      message: "New Course Created Successfully",
      newCourse,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

// for updloading content to a particular course

export const uploadContent = async (req, res) => {
  try {
    const { content } = req.files;
    const { name } = req.fields;
    const { cid } = req.params;

    switch (true) {
      case !cid:
        throw new Error("Course ID is Required to upload content");
      case !content:
        throw new Error("Content to be uploaded is Required to upload content");
      case !name:
        throw new Error("Content is Required to upload content");
    }

    const results = await cloudinary.uploader.upload(content.path, {
      public_id: `${name}_content`,
      resource_type: "video",
      format: "mp4",
      folder: "Course Content",
      use_asset_folder_as_public_id_prefix: false,
    });

    if (!results) {
      return res.status(400).send({
        success: false,
        message: "Error while uploading content",
      });
    } else {
      const newContent = new ContentModel({
        name: name,
        content: results,
      });

      // await newContent.save();
      //I'm not saving content individually as we can access notes related to a course from the array of notes inside that course itself. we can save notes individually for other purposes.


      const updatedCourse = await CourseModel.findByIdAndUpdate(
        { _id: cid },
        { $push: { content: newContent } },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Content Uploaded Successfully",
        updatedCourse,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//for uploading content to a particular course

export const uploadNotes = async (req, res) => {
  try {
    const { notes } = req.files;
    const { name } = req.fields;
    const { cid } = req.params;

    switch (true) {
      case !cid:
        throw new Error("Course ID is Required to upload content");
      case !notes:
        throw new Error("Notes to be uploaded is Required to upload content");
      case !name:
        throw new Error("Notes name is Required for uploading");
    }

    const results = await cloudinary.uploader.upload(notes.path, {
      public_id: `${name}_notes`,
      resource_type: "raw",
      format: "pdf",
      folder: "Notes",
      use_asset_folder_as_public_id_prefix: false,
    });

    if (!results) {
      return res.status(400).send({
        success: false,
        message: "Error while uploading notes",
      });
    } else {
      const newNotes = await new NotesModel({
        name: name,
        notes: results,
      });

      
      // await newNotes.save();
      //I'm not saving notes individually as we can access notes related to a course from the array of notes inside that course itself. we can save notes individually for other purposes.

      const updatedCourse = await CourseModel.findByIdAndUpdate(
        { _id: cid },
        { $push: { notes: newNotes } },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Notes Uploaded Successfully",
        updatedCourse,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//for deleting content  from a particular course

export const deleteAContent = async (req, res) => {
  try {
    const { name, publicId } = req.body;
    if (!name) {
      throw new Error("Name of the centent to be deleted is Required");
    } else {
      const deleteContent = await CourseModel.findOneAndUpdate(
        { content: { $elemMatch: { name: name } } },
        { $pull: { content: { name: name } } },
        { new: true }
      );
      // console.log(deleteContent);
      if (!deleteContent) {
        return res.status(400).send({
          success: false,
          message:
            "Either the Content is already deleted or the Name provided is invalid",
        });
      } else {
        if (!publicId) {
          return res.status(400).send({
            success: false,
            message: "public id is required to delete asset from cloud storage",
          });
        } else {
          const { result } = await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
          if (result !== "ok") {
            return res.status(400).send({
              success: false,
              message: "Invalid Public Id",
            });
          } else {
            res.status(200).send({
              success: true,
              message: "Content has been deleted successfully",
              deleteContent,
            });
          }
        }
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//For Deleting notes from a particular course

export const deleteNotes = async (req, res) => {
  try {
    const { name, publicId } = req.body;
    if (!name) {
      throw new Error("Name of the centent to be deleted is Required");
    } else {
      const deleteNotes = await CourseModel.findOneAndUpdate(
        { notes: { $elemMatch: { name: name } } },
        { $pull: { notes: { name: name } } },
        { new: true }
      );
      // console.log(deleteContent);
      if (!deleteNotes) {
        return res.status(400).send({
          success: false,
          message:
            "Either the Notes are already deleted or the Name provided is invalid",
        });
      } else {
        if (!publicId) {
          return res.status(400).send({
            success: false,
            message: "public id is required to delete asset from cloud storage",
          });
        } else {
          const { result } = await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw",
          });
          if (result !== "ok") {
            return res.status(400).send({
              success: false,
              message: "Invalid Public Id",
            });
          } else {
            res.status(200).send({
              success: true,
              message: "Notes have been deleted successfully",
              deleteNotes,
            });
          }
        }
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//delete a course

export const deleteCourse = async (req, res) => {
  try {
    const { cid } = req.params;
    const { pid } = req.body;
    if (!cid) {
      throw new Error("ID of the Course to be deleted is Required");
    } else {
      const deletedCourse = await CourseModel.findByIdAndDelete({ _id: cid });

      if (!deletedCourse) {
        return res.status(400).send({
          success: false,
          message:
            "Either the Course has already been Deleted or the ID provided is invalid",
        });
      } else {
        if (!pid) {
          return res.status(400).send({
            success: false,
            message:
              "public Id of the asset is required to delete the asset from cloud-storage",
          });
        } else {
          //deleting Course coverPhoto from cloudinary

          const { result } = await cloudinary.uploader.destroy(pid, {
            resource_type: "image",
          });

          if (result !== "ok") {
            return res.status(400).send({
              success: false,
              message: "Invalid Public ID",
            });
          } else {
            res.status(200).send({
              success: true,
              message: "The Course has been deleted Successfully",
              deletedCourse,
            });
          }
        }
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//delete All courses

export const deleteAllCourses = async (req, res) => {
  try {
    const courses = await CourseModel.deleteMany({});

    if (!courses) {
      return res.status(400).send({
        success: false,
        message: "No Course Found For Deleting",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "All Courses Have Been Deleted Successfully",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//fetch all courses with a limit of 6 courses per page

export const getCourses = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;

    const courses = await CourseModel.find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    if (courses.length === 0) {
      return res.status(201).send({
        success: true,
        message: "No Courses Available",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Fetched All Courses Successfully",
        courses,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//fetch a particular course

export const getACourse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("Course ID is required to fetch the course");
    } else {
      const course = await CourseModel.findById({ _id: id });
      if (!course) {
        return res.status(400).send({
          success: false,
          message: "No course Found",
        });
      } else {
        res.status(200).send({
          success: true,
          message: "Course Fetched Successfully",
          course,
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//update a course

export const updateCourse = async (req, res) => {
  try {
    const { name, category, duration, price } = req.body;
    const { cid } = req.params;
    switch (true) {
      case !cid:
        throw new Error("Course ID is Required");
      case !name:
        throw new Error("Course Name is Required");
      case !category:
        throw new Error("Course Category is Required");
      case !duration:
        throw new Error("Course Duration is Required");
      case !price:
        throw new Error("Course Price is Required");
    }
    const course = await CourseModel.findByIdAndUpdate(
      { _id: cid },
      { name: name, duration: duration, category: category, price: price },
      { new: true }
    );
    if (!course) {
      return res.status(400).send({
        success: false,
        message: "No Course Found Or The Course ID is Invalid",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Course Updated Successfully",
        course,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//update Cover Photo of a course

export const updateCover = async (req, res) => {
  try {
    const { cid } = req.params;
    const { coverPhoto } = req.files;
    if (!cid) {
      throw new Error("Course ID is required");
    } else {
      const photo = await cloudinary.uploader.upload(coverPhoto.path, {
        public_id: `${cid}_cover`,
        resource_type: "image",
        folder: "Course Cover",
      });
      if (!photo) {
        throw new Error("Error While Uploading to the cloud");
      } else {
        const course = await CourseModel.findByIdAndUpdate(
          { _id: cid },
          { coverPhoto: photo },
          { new: true }
        );
        if (!course) {
          return res.status(400).send({
            success: false,
            message: "Invalid Course ID Or No Course Found",
          });
        } else {
          res.status(200).send({
            success: true,
            message: "Cover Photo Updated Successfully",
            course,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//get course by filters

export const getCourseUsingFilters = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;

    if (req.query.level || req.query.popularity || req.query.category) {
      const course = await CourseModel.find({
        $or: [
          { category: req.query.category ? req.query.category : "" },
          { level: req.query.level ? req.query.level : "" },
          { popularity: req.query.popularity ? req.query.popularity : "" },
        ],
      })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 });
      res.status(200).send({
        success: true,
        message: `${course.length} results found for the applied fiters`,
        courses: course,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// search courses

export const searchCourse = async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword) {
      throw new Error("KeyWord is Required to Search");
    } else {
      const perPage = 6;
      const page = req.params.page ? req.params.page : 1;
      const searchResults = await CourseModel.find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { category: { $regex: keyword, $options: "i" } },
        ],
      })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 });
      if (searchResults.length === 0) {
        return res.status(201).send({
          success: true,
          message: `No Reasults For ${keyword}`,
        });
      } else {
        res.status(200).send({
          success: true,
          message: `${searchResults.length} results found for ${keyword}`,
          searchResults,
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};
