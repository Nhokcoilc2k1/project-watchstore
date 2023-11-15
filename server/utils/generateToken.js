import jwt from 'jsonwebtoken';

// Tạo ra chuỗi token. đối số 1 là payload, 2 khóa bí mật dùng để kí và xác minh token, 3 thời gian hết hạn của token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: "1d",
    });
};

export default generateToken;