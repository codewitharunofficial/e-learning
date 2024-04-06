import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: {},
    }, 
    emailStatus: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Verified"]
    }, 
    autoDeleteNotVerifiedIn: {
        type: Date,
        default: () => new Date(+ new Date() + 7*24*60*60*1000)
    }, 
    role: {
        type: String,
        default: "User",
        enum: ["Admin", "User"]
    },
    enrolledCourses: {
        type: []
    }
}, {timestamps: true});

export default mongoose.model("User", UserSchema);

