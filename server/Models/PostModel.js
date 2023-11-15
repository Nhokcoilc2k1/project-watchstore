import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    image: {
        type: String,
        default: 'https://cdn.tgdd.vn//GameApp/-1//maytinh-17-800x450-11.jpg'
    }
},
{
    timestamps: true
})

const Post = mongoose.model("Post", postSchema)

export default Post;