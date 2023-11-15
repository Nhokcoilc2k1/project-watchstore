import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    status: {
        type: Boolean,
        require: true,
    },
    image: {
        type: String,
    }
},{
    timestamps: true
})

const Category = mongoose.model("Category", categorySchema)

export default Category;