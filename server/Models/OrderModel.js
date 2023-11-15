import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: String, required: true },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Product",
            },
            totalQyt:{ type: Number, required: true },
        }
    ],
    name: {type: String, required: true},
    phone: {type: String, required: true},
    address: {type: String, required: true},
    note: {type: String},
    totalPrice: {type: Number,required: true},
    status: {type: String, enum: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng','Đã giao hàng', 'Đã hủy'], default: 'pending'},
    isPaid: {type: Boolean, required: true, default: false}
},{
    timestamp: true,
});
const Order = mongoose.model("Order", orderSchema);
export default Order;