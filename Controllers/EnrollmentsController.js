import CourseModel from "../Models/CourseModel.js";
import EnrollmentModel from "../Models/EnrollmentModel.js";
import UserModel from "../Models/UserModel.js";


// User Enrolling for a course 
export const newEnroll = async (req, res) => {
  try {
    const { id, cid } = req.params;
    switch (true) {
      case !id:
        throw new Error("User Id is required");
      case !cid:
        throw new Error("Course ID is required");
    }
    const student = await UserModel.findById({ _id: id });
    const course = await CourseModel.findOne({ _id: cid });
    const checkEnroll = await EnrollmentModel.findOne({
      studentEmail: student.email,
      "courseEnrolledFor.name": course.name,
    });
    if (!student) {
      return res.status(400).send({
        success: false,
        message: "Invalid User ID",
      });
    } else if (checkEnroll) {
      return res.status(400).send({
        success: false,
        message: "You've Already Enrolled for this course",
      });
    } else {
      const enroll = new EnrollmentModel({
        studentName: student.name,
        studentEmail: student.email,
        studentPhone: student.phone,
        studentPhoto: student.profilePhoto,
        courseEnrolledFor: course,
      });
      await enroll.save();
      await student.updateOne(
        { $push: { enrolledCourses: course } },
        { new: true }
      );
      await course.updateOne({ $push: { enrolls: student } }, { new: true });
      res.status(200).send({
        success: true,
        message: "You've Enrolled Successfully",
        enroll,
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

