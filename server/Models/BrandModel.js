import mongoose from "mongoose";

const brandSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    status: {
        type: Boolean,
        require: true,
    }
},{
    timestamps: true
})

const Brand = mongoose.model("Brand", brandSchema)

export default Brand;