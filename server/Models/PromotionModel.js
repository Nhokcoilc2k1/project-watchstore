import mongoose from "mongoose";

const promotionSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    coupon_code: {
        type: String,
        require: true,
    },
    discount_type: {
        type: String,
        require: true,
    },
    discount_value: {
        type: String,
        require: true,
    },
    max_discount_value: {
        type: String,
        require: true,
    },
    expired_at: {
        type: String,
        require: true,
    }
},{
    timestamps: true
})

const Promotion = mongoose.model("Promotion", promotionSchema)

export default Promotion;