import express from 'express';
import asyncHandler from 'express-async-handler'
import Category from '../Models/CategoryModel.js';

const categoryRoutes = express.Router();

// GET ALL BRAND
categoryRoutes.get(
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
        let queryCommand = Category.find(formatedQueries);

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
            const counts = await Category.find(formatedQueries).countDocuments();
            return res.status(200).json({
              success: response ? true : false,
              categorys: response ? response : 'Cannot get categorys',
              pagination: {
                  counts,
                  page,
                  limit,
              }
            });
          } catch (err) {
            throw new Error(err.message);
          }
    // const categorys = await Category.find({});
    // res.json(categorys);
}))

// GET SINGLE BRAND
categoryRoutes.get(
    "/:id", 
    asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {
        res.json(category);    
    } else {
        res.status(404);
        throw new Error("Category not Found");
    }
}))

// POST BRAND
categoryRoutes.post(
    "/", 
    asyncHandler(async(req, res) => {
        const {name, status, description, image} = req.body;
        const categoryExit = await Category.findOne({name})
        if(categoryExit){
            res.status(400);
            throw new Error("Category name already exist");
        } else {
            const category = new Category({
                name,
                status,
                description,
                image,
            });
            if(category){
                const createCategory = await category.save();
                res.status(201).json(createCategory);
            }else{
                res.status(400);
                throw new Error("Invalid create data");
            }
        }
    }))

// UPDATE BRAND
categoryRoutes.put(
    "/:id",
    asyncHandler(async(req, res) => {
        const {name, status, description, image} = req.body;
        const category = await Category.findById(req.params.id);
         
        if(category){
            category.name = name;
            category.status = status;
            category.description = description;
            category.image = image;
            const updateProduct = await category.save();
            res.json(updateProduct);
        }else{
            res.status(404);
            throw new Error('category not found');
        }
    })
    )

// DELETE BRAND
categoryRoutes.delete(
    "/:id",
    asyncHandler(async (req, res) => {
        const deleteCategory = await Category.findByIdAndDelete(req.params.id);
        if(deleteCategory){
            res.status(200).json('Delete successful');
        }else{
            res.status(404);
            throw new Error('Unsuccesful');
        }
    }))

// SEARCH 
categoryRoutes.get(
    "/search/:keyword",
    asyncHandler(async (req, res) => {
        let listOfCategory = await Category.find({
            name : {$regex : new RegExp(req.params.keyword, 'i')}
        })
        if(listOfCategory){
            res.status(200).json(listOfCategory)
        }else{
            res.status(404);
            throw new Error("not find category")
        }
    })
)
    
export default categoryRoutes;
