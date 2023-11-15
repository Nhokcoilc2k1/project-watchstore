import bcrypt from 'bcryptjs'

const users = [
    {
       name: 'admin',
       email: 'admin@gmail.com',
       password:bcrypt.hashSync('123456', 10),
       address: 'Bảo Hà-Bảo yên-Lào cai',
       phone: "0967567567",
       roles: "admin",
    },
    {
        name: 'user',
        email: 'user@gmail.com',
        phone: "0973456788",
         address: '213 Trần Đại Nghĩa- HBT- HN',
         password:bcrypt.hashSync('123456', 10),
     },
]

export default users;