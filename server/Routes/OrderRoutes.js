import express from 'express';
import asyncHandler from 'express-async-handler';
import protect, { isAdmin } from '../Middleware/AuthMiddleware.js';
import Order from '../Models/OrderModel.js';

const orderRouter = express.Router();

// CREATE ORDER
orderRouter.post(
    "/",
    protect,
    asyncHandler(async (req, res) => {
        const {orderItems,isPaid, name, phone, address, note, totalPrice} = req.body;
        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({message: 'Không có mặt hàng nào'})
        } else {
            const order = new Order({
                orderItems, 
                user: req.user._id,
                name,
                phone,
                address,
                note,
                isPaid,  
                totalPrice,   
            })
            const createOrder = await order.save();
            res.status(201).json(createOrder);
        }
        
}))

// GET ORDER BY ID
orderRouter.get(
    "/:id",
    protect,
    asyncHandler(async (req, res) => {
        const order = await Order.find({user: req.user._id});
        if(order){
            res.json(order);
        }else{
            return res.status(404).json("Không tìm thấy đơn hàng")
        }
        
}))

// GET ALL ORDER
orderRouter.get(
    '/',
    // protect,
    // isAdmin,
    asyncHandler(async(req, res) => {
        const queries = {...req.query};
        // tách các trường đặt biệt ra khỏi query
        const excludeFields = ['limit', 'sort', 'page', 'fields'];
        excludeFields.forEach(el => delete queries[el]);
        // Format lại các operators cho đúng cú pháp 
        let queryString = JSON.stringify(queries);
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`);
        const formatedQueries = JSON.parse(queryString);

        //  Filtering
        if(queries?.name) formatedQueries.name = {$regex: queries.name, $options: 'i'}
        let queryCommand = Order.find(formatedQueries);

        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            queryCommand = queryCommand.select(fields);
        }else{
            queryCommand = queryCommand.select('-__v')
        }

        const page = +req.query.page  || 1
        const limit = +req.query.limit  
        const skip = (page - 1) * limit
        queryCommand.skip(skip).limit(limit)

        try {
            const response = await queryCommand.exec();
            const counts = await Order.find(formatedQueries).countDocuments();
            return res.status(200).json({
              success: response ? true : false,
              orders: response ? response : 'Cannot get orders',
              pagination: {
                  counts,
                  page,
                  limit,
              }
            });
          } catch (err) {
            throw new Error(err.message);
          }
        // const orders = await Order.find({});
        // if(orders){
        //     res.status(200).json(orders)
        // }else{
        //     res.status(400).json("Không có đơn hàng nào")
        // }
    })
)

// ORDER DELETE
orderRouter.delete(
    '/:id',
    protect,
    asyncHandler(async(req, res) => {
        const deleteOrder = await Order.findByIdAndDelete(req.params.id);
        if(deleteOrder){
            res.status(201).json('Xóa thành công')
        }else{
            res.status(400).json('Xóa không thành công')
        }
    })
)

// UPDATE ORDER
orderRouter.put(
    '/:id',
    // protect,
    asyncHandler(async(req, res) => {
        const {status} = req.body;
        const order = await Order.findById(req.params.id)
        if(order){
            order.status = status
            const updateOrder = await order.save();
            res.json(updateOrder);
        }else{
            res.status(400);
            throw new Error("update unsucess");
        }
    })
)

// GET ORDER ID
orderRouter.get(
    "/by/:id",
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if(order){
            res.json(order);
        }else{
            res.status(404);
            throw new Error('order is not Found');
        }
    })
)

export default orderRouter;