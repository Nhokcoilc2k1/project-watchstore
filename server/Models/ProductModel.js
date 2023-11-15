import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number },
    comment: { type: String},
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    },
    {
    timestamps: true,
    }
  )

const productSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        require: true,
    },
    // image: {
    //     type: Array,
    // },
    description: {
        type: String,
        require: true,
    },
    reviews: [reviewSchema],
    quantity:{
        type: Number,
        require: true,
        default: 0,
    },
    price: {
        type: Number,
        require: true,
        default: 0,
    },
    totalRating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    sale_price: {
        type: Number,
        require: true,
    },
    discount_value: {
        type: Number,
        require: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        require: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        require: true,
    },
},{
    timestamps: true
})

const Product = mongoose.model("Product", productSchema)

export default Product;