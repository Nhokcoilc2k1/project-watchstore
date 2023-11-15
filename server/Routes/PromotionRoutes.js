import express from 'express';
import asyncHandler from 'express-async-handler'
import Promotion from '../Models/PromotionModel.js';

const promotionRoute = express.Router();

// GET ALL PROMO
promotionRoute.get(
    "/",
    asyncHandler( async(req, res) => {
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
        let queryCommand = Promotion.find(formatedQueries);

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
            const counts = await Promotion.find(formatedQueries).countDocuments();
            return res.status(200).json({
              success: response ? true : false,
              promotions: response ? response : 'Cannot get promotions',
              pagination: {
                  counts,
                  page,
                  limit,
              }
            });
          } catch (err) {
            throw new Error(err.message);
          }
    })
)

// GET SINGLE PROMO
promotionRoute.get(
    "/:id", 
    asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);
    if (promotion) {
        res.json(promotion);    
    } else {
        res.status(404);
        throw new Error("Promotions not Found");
    }
}))

// POST PROMO
promotionRoute.post(
    "/", 
    asyncHandler(async(req, res) => {
        const {name, coupon_code, discount_type, discount_value, max_discount_value, expired_at} = req.body;
        const promotionExit = await Promotion.findOne({name})
        if(promotionExit){
            res.status(400);
            throw new Error("promotion name already exist");
        } else {
            const promotion = new Promotion({
                name, 
                coupon_code, 
                discount_type, 
                discount_value, 
                max_discount_value, 
                expired_at
            });
            if(promotion){
                const createPromo = await promotion.save();
                res.status(201).json(createPromo);
            }else{
                res.status(400);
                throw new Error("Invalid promotion data");
            }
        }
    }))
// UPDATE PROMO
promotionRoute.put(
    "/:id",
    asyncHandler(async (req, res) => {
        const {name, coupon_code, discount_type, discount_value, max_discount_value, expired_at} = req.body;
        const promo = await Promotion.findById(req.params.id);

        if(promo){
            promo.name = name;
            promo.coupon_code = coupon_code;
            promo.discount_type = discount_type;
            promo.discount_value = discount_value;
            promo.max_discount_value = max_discount_value;
            promo.expired_at = expired_at;

            const updatePromo = await promo.save();
            res.status(202).json(updatePromo);
        }else{
            res.status(404);
            throw new Error("promotion not found");
        }
    })
)

// DELETE PROMO
promotionRoute.delete(
    "/:id",
    asyncHandler(async (req, res) => {
        const deletePromo = await Promotion.findByIdAndDelete(req.params.id);
        if(deletePromo){
            res.status(202).json('Delete Promo successful')
        }else{
            res.status(400);
            throw new Error("Delete Unsuccessful!");
        }
    })
)

// SEARCH 
promotionRoute.get(
    "/search/:keyword",
    asyncHandler(async(req, res) => {
        let listOfPromo = Promotion.find({
            name: {$regex: new RegExp(req.params.keyword, 'i')},
            discount_type: {$regex: new RegExp(req.params.keyword, 'i')}
        });
        console.log(keyword);
        if(listOfPromo){
            res.status(200).json(listOfPromo);
        }else{
            res.status(400);
            throw new Error("Promo not find!")
        }
    })
)

    export default promotionRoute;