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
      format: "mp4"
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
    res.status(400).send({
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
    const { name, id } = req.fields;

    switch (true) {
      case !id:
        throw new Error("Course ID is Required to upload content");
      case !content:
        throw new Error("Content to be uploaded is Required to upload content");
      case !name:
        throw new Error("Content is Required to upload content");
    }

    const results = await cloudinary.uploader.upload(content.path, {
      public_id: `${name}_content`,
      resource_type: "video",
    });

    if (!results) {
      return res.status(400).send({
        success: false,
        message: "Error while uploading content",
      });
    } else {
      const newContent = await new ContentModel({
        name: name,
        content: results,
      });
      await newContent.save();
      const updatedCourse = await CourseModel.findByIdAndUpdate(
        { _id: id },
        {$push: {content: newContent}},
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Content Uploaded Successfully",
        updatedCourse,
      });
    }
  } catch (error) {
    res.status(400).send({
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
      const { name, id } = req.fields;
  
      switch (true) {
        case !id:
          throw new Error("Course ID is Required to upload content");
        case !notes:
          throw new Error("Notes to be uploaded is Required to upload content");
        case !name:
          throw new Error("Notes name is Required for uploading");
      }
  
      const results = await cloudinary.uploader.upload(notes.path, {
        public_id: `${name}_notes`,
        resource_type: "raw",
        format: "pdf"
      });
  
      if (!results) {
        return res.status(400).send({
          success: false,
          message: "Error while uploading content",
        });
      } else {
        const newNotes = await new NotesModel({
          name: name,
          notes: results,
        });
        // await newNotes.save();
        const updatedCourse = await CourseModel.findByIdAndUpdate(
          { _id: id },
          {$push: {notes: newNotes}},
          { new: true }
        );
        res.status(200).send({
          success: true,
          message: "Notes Uploaded Successfully",
          updatedCourse,
        });
      }
    } catch (error) {
      res.status(400).send({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
    }
  };