import express from 'express';
import asyncHandler from 'express-async-handler';
import Brand from '../Models/BrandModel.js';
import protect from '../Middleware/AuthMiddleware.js';

const brandRoute = express.Router();

// GET ALL BRAND
brandRoute.get(
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
        let queryCommand = Brand.find(formatedQueries);

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
            const counts = await Brand.find(formatedQueries).countDocuments();
            return res.status(200).json({
              success: response ? true : false,
              brands: response ? response : 'Cannot get brands',
              pagination: {
                  counts,
                  page,
                  limit,
              }
            });
          } catch (err) {
            throw new Error(err.message);
          }

    // const brands = await Brand.find({});
    // res.json(brands);
}))

// GET SINGLE BRAND
brandRoute.get(
    "/:id", 
    asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if (brand) {
        res.json(brand);    
    } else {
        res.status(404);
        throw new Error("Brands not Found");
    }
}))

// POST BRAND
brandRoute.post(
    "/", 
    asyncHandler(async(req, res) => {
        const {name, image, description, status} = req.body;
        const brandExit = await Brand.findOne({name})
        if(brandExit){
            res.status(400);
            throw new Error("Brand name already exist");
        } else {
            const brand = new Brand({
                name,
                image,
                description,
                status,
            });
            if(brand){
                const createBrand = await brand.save();
                res.status(201).json(createBrand);
            }else{
                res.status(400);
                throw new Error("Invalid brand data");
            }
        }
    }))

// UPDATE BRAND
brandRoute.put(
    "/:id",
    asyncHandler(async(req, res) => {
        const {name, image, description, status} = req.body;
        const brand = await Brand.findById(req.params.id);
        if(brand){
            brand.name = name;
            brand.image = image;
            brand.description = description;
            brand.status = status;

            const updateProduct = await brand.save();
            res.json(updateProduct);
        }else{
            res.status(404);
            throw new Error('brand not found');
        }
    })
    )

// DELETE BRAND
brandRoute.delete(
    "/:id",
    asyncHandler(async (req, res) => {
        const deleteBrand = await Brand.findByIdAndDelete(req.params.id);
        if(deleteBrand){
            res.status(200).json('Delete successful');
        }else{
            res.status(404);
            throw new Error('Unsuccesful');
        }
    }))

// SEARCH
brandRoute.get(
    "/search/:keyword",
    asyncHandler( async (req, res) => {
        const listOfBrand = await Brand.find({
            name: {
                $regex: req.params.keyword,
                $options: "i"
            },
        })
        if(listOfBrand){
            res.status(200).json(listOfBrand);
        }else{
            res.status(400);
            throw new Error("not find brand");
        }
    })
)
export default brandRoute;