import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    notes: {
       type: {},
       required: true
    }
});

export default mongoose.model("Notes", NotesSchema);