import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../Models/UserModel.js';
import generateToken from '../utils/generateToken.js';
import protect from '../Middleware/AuthMiddleware.js';

const usertRouter = express.Router();

// LOGIN
usertRouter.post(
    "/login",
    asyncHandler(async (req, res) => {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!email || !password){
            return res.status(401).json("Thiếu đầu vào");
        }

        if(user && (await user.matchPassword(password))){
            if(user.status){
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id),
                    roles: user.roles,
                    createdAt: user.createdAt,
                })
            }else{
                return res.status(401).json("Tài khoản ngưng hoạt động. Vui lòng đăng nhạp bằng tài khoản khác.")
            }
        }else{
           return res.status(401).json('Tên đăng nhập hoặc mật khẩu tài khoản của bạn không đúng, vui lòng thử lại');
        }
}))

// REGISTER 
usertRouter.post(
    "/",
    asyncHandler(async (req, res) => {
        const {name, phone, email, password} = req.body;
        const userExit = await User.findOne({email});
        const phoneExit = await User.findOne({phone});

        if(!name || !phone || !email || !password){
            return res.status(401).json("Thiếu đầu vào");
        }

        if(userExit){
           return res.status(400).json('Email đã được đăng kí!, vui lòng sử dụng email khác');
        }

        if(phoneExit){
            return res.status(400).json('Số điện thoại đã được đăng kí!, vui lòng sử dụng số điện thoại khác');
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
        })

        if(user){
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                roles: user.roles,
                token: generateToken(user._id),
            });
        }else{
           return res.status(400).json('Dữ liệu không hợp lệ');
        }
}))

// PROFILE
usertRouter.get(
    "/profile",
    protect,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);

        if(user){
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                roles: user.roles,
                createdAt: user.createdAt,
            });
        }else{
            res.status(404);
            throw new Error("User not found");
        }
}))

// UPDATE PROFILE
usertRouter.put(
    "/profile",
    protect,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);

        if(user){
            user.name = req.body.name
            user.phone = req.body.phone
            user.email = req.body.email
            user.address = req.body.address
            
            const updateUser = await user.save();
            res.json({
                _id: updateUser._id,
                name: updateUser.name,
                email: updateUser.email,
                phone: updateUser.phone,
                address: updateUser.address,
                roles: updateUser.roles,
                token: generateToken(user._id),
            })
        }else{
            res.status(404);
            throw new Error("User not found");
        }
}))

// GET ALL USER
usertRouter.get(
    "/",
    asyncHandler(async (req, res) => {
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
        let queryCommand = User.find(formatedQueries);

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
            const counts = await User.find(formatedQueries).countDocuments();
            return res.status(200).json({
              success: response ? true : false,
              users: response ? response : 'Cannot get categorys',
              pagination: {
                  counts,
                  page,
                  limit,
              }
            });
          } catch (err) {
            throw new Error(err.message);
          }
}))

// UPDATE USER
usertRouter.put(
    '/:id',
    asyncHandler(
        async(req, res) => {
            const {status} = req.body;
            const user = await User.findById(req.params.id);

            if(user){
                user.status = status;
                const updateUser = await user.save();
                res.json(updateUser);
            }else{
                return res.status(401).json("Người dùng không tồn tại");
            }
        }
    )
)


export default usertRouter;