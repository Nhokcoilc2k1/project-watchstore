import  Jwt  from "jsonwebtoken";
import asyncHandler from 'express-async-handler';
import User from '../Models/UserModel.js';

//xác thực và giải mã token JWT (JSON Web Token) để xác định người dùng đã xác thực.
const protect = asyncHandler(
    async(req, res, next) => {
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            try {
                token = req.headers.authorization.split(" ")[1]; //  trích xuất token từ tiêu đề "Authorization" trong yêu cầu HTTP.

                const decoded = Jwt.verify(token, process.env.JWT_SECRET);
                //tìm người dùng trong cơ sở dữ liệu dựa trên id được giải mã từ decoded.
                req.user = await User.findById(decoded.id).select("-password");
                next();
            } catch (error) {
                console.log(error);
               return res.status(401).json("Not authorized, token failed");
            }
        }

        if(!token){
           return res.status(401).json('Not authorized,no token');
        }
    }
)

// check xem người dùng có phải admin không, trước hết phải protect trước xác thực xem người dùng đã xác thực
// (token còn sống không) sau đó lấy ra roles check nếu là admin thì làm tiếp không thì vào else
// dùng cho mấy hàm get bên trang Admin
export const isAdmin = (req, res, next) => {
    const {roles} = req.user;
    if(roles !== 'admin'){
        return res.status(401).json("Bạn không có quyền truy cập");
    }
    next();
}

export default protect ;