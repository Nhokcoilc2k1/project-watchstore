import express, { response } from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../Models/ProductModel.js';
import protect, { isAdmin } from '../Middleware/AuthMiddleware.js';
import uploadCloud from '../config/cloudinary.config.js';

const productRoute = express.Router();

// GET ALL PRODUCT
productRoute.get(
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
        let queryCommand = Product.find(formatedQueries);

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            queryCommand = queryCommand.sort(sortBy)
          } else {
            queryCommand = queryCommand.sort('-createdAt')
          }

        // Fields limiting
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            queryCommand = queryCommand.select(fields);
        }else{
            queryCommand = queryCommand.select('-__v')
        }

        // Pagination
        // limit: số object lấy về 1 lần gọi api
        // skip: 2. bỏ qua 2 cái đầu

        const page = +req.query.page  || 1
        const limit = +req.query.limit  || process.env.LIMIT_PRODUCT
        const skip = (page - 1) * limit
        queryCommand.skip(skip).limit(limit)
        // Execute query
        //  Số lượng sp thỏa mãn điều kiện !== số lượng sản phẩm trả về 1 lần gọi api
        try {
            const response = await queryCommand.exec();
            const counts = await Product.find(formatedQueries).countDocuments();
            return res.status(200).json({
              success: response ? true : false,
              products: response ? response : 'Cannot get products',
              pagination: {
                  counts,
                  page,
                  limit,
              }
            });
          } catch (err) {
            throw new Error(err.message);
          }

        // const products = await Product.find({});
        // res.json(products);
}))

// GET SINGLE PRODUCT
productRoute.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);
        if(product){
            res.json(product);
        }else{
            res.status(404);
            throw new Error('Product is not Found');
        }
    })
)

// POST PRODUCT
productRoute.post(
    "/",
    asyncHandler(async (req, res) => {
        const {name, image,quantity, rating, description, price, sale_price, discount_value, category, brand} = req.body;
        const productExit = await Product.findOne({name});
        if(productExit){
            res.status(400);
            throw new Error("product name already exist");
        }else{
            const product = new Product({
                name, 
                image, 
                description, 
                price, 
                sale_price, 
                discount_value, 
                category, 
                brand,
                quantity,
                rating,
            });
            if(product){
                const createProduct = await product.save();
                res.status(200).json(createProduct);
            }else{
                res.status(400);
                throw new Error("Invalid product data");
            }
        }
    })
)

// UPDATE PRODUCT
productRoute.put(
    "/:id",
    asyncHandler(async (req, res) => {
        const {name, image, description, price, sale_price, quantity, rating, discount_value, category, brand} = req.body;
        const product = await Product.findById(req.params.id)
        if(product){
            product.name = name;
            product.image = image;
            product.description = description;
            product.price = price;
            product.sale_price = sale_price;
            product.discount_value = discount_value;
            product.category = category;
            product.brand = brand;
            product.quantity = quantity;
            product.rating = rating;

            const updateProduct = await product.save();
            res.json(updateProduct);
        }else{
            res.status(404);
            throw new Error("update unsucess");
        }
    })
)

// DELETE PRODUCT
productRoute.delete(
    "/:id",
    asyncHandler( async(req, res) => {
        const deleteProduct = await Product.findByIdAndDelete(req.params.id)
        if(deleteProduct){
            res.status(200).json("Delete success!");
        }else{
            res.status(400);
            throw new Error("Delete Unsuccessful !");
        }
    })
)

//PRODUCT REVIEW
productRoute.post(
    "/:id/review",
    protect,
    asyncHandler(async (req, res) => {
        const {rating, comment} = req.body;
        const product = await Product.findById(req.params.id);

        // if (product) {
        //     const alreadyReviewed = product.reviews.find(
        //       (r) => r.user.toString() === req.user._id.toString()
        //     );
        //     if (alreadyReviewed) {
        //       res.status(400);
        //       throw new Error("Product already Reviewed");
        //     }
        //     const review = {
        //       name: req.user.name,
        //       rating: Number(rating),
        //       comment,
        //       user: req.user._id,
        //     };
      
        //     product.reviews.push(review);
        //     product.numReviews = product.reviews.length;
        //     product.rating =
        //       product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        //       product.reviews.length;
      
        //     await product.save();
        //     res.status(201).json({ message: "Reviewed Added" });
        //   } else {
        //     res.status(404);
        //     throw new Error("Product not Found");
        //   }
        if(product){
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );
            if(alreadyReviewed){
                alreadyReviewed.rating = rating;
                alreadyReviewed.comment = comment;
            }else{
                const review = {
                    name: req.user.name,
                    rating: Number(rating),
                    comment,
                    user: req.user._id
                };
        
                product.reviews.push(review);
            }
                
            product.numReviews = product.reviews.length;
            const sumRatings = product.reviews.reduce((sum, el) => sum + +el.rating, 0);
            product.totalRating = Math.round(sumRatings * 10 / product.reviews.length )/10;

            await product.save();
            res.status(201).json({message: 'Bình luận đã được thêm'});
        }else{
           return res.status(404).json('Sản phẩm không tồn tại');
        }
    })
)

// UPLOAD IMAGE PRODUCT
productRoute.put(
    "/uploadimage/:id",
    protect,
    isAdmin,
    uploadCloud.single('images'),
    asyncHandler(async(req, res) => {
        console.log(req.file);
        return res.json('oke')
    })
)

// GET PRODUCT NEW
productRoute.get(
    '/lastest-products',
    asyncHandler(async(req, res) => {
        const latestProducts = await Product.find({}).sort({ createdAt: -1 }).limit(10);
        if(latestProducts){
            res.status(200).json(latestProducts);
        }else{
           return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy các sản phẩm mới nhất.' });
        }
    })

)

// GET PRODUCT BEST-SELLING
productRoute.get(
    '/best-selling-products',
    asyncHandler(async(req, res) => {
        const bestSellingProducts = await Product.find({}).sort({ salesCount: -1 }).limit(10);
        if(bestSellingProducts){
            res.status(200).json(bestSellingProducts);
        }else{
            return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy các sản phẩm bán chạy nhất.' });
        }
    })
)


export default productRoute;