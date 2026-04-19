import mongoose from "mongoose";

const atsscoreSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    score : {
        type : Number,
        required : true,
    },
    /** Resume text parse quality (0–100) used when computing combined ATS score */
    parseRate : {
        type : Number,
        min : 0,
        max : 100,
        default : null,
    },
}, { timestamps : true });

export const Atsscore = mongoose.model("Atsscore", atsscoreSchema);