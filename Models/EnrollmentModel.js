import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    enrollmentNo: {
      type: String,
      default: () => Math.floor(200000 + Math.random() * 10000).toString(),
      unique: true,
    },
    studentEmail: {
      type: String,
      required: true
    },
    studentPhone: {
      type: String,
      required: true,
    },
    studentPhoto: {
      type: {},
    },
    courseEnrolledFor: {
      type: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", EnrollmentSchema);
