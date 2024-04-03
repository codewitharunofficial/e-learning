import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    coverPhoto: {
        type: {},
        required: true
    },
    notes: {
        type: [],
    },
    content: {
        type: [],
    },
    price: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Front-End Web Dev", "Back-End Web Dev", "Full-Stack Web Dev", "Software Development"]
    },
    duration: {
        type: String,
        required: true
    }
}, {timestamps: true});

export default mongoose.model("Course", CourseSchema);