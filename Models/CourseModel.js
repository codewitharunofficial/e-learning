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
    },
    duration: {
        type: String,
        required: true
    },
    enrolls: {
        type: []
    },
    level: {
        type: String,
        default: "All",
        enum: ["Beginner", "Intermediate", "Advance", "All"]
    }, 
    popularity: {
        type: Number,
        default: 5,
        enum: [5, 4, 3, 2, 1]
    },
}, {timestamps: true});

export default mongoose.model("Course", CourseSchema);