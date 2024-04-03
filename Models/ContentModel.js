import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    content: {
       type: {},
       required: true
    }
});

export default mongoose.model("Content", ContentSchema);