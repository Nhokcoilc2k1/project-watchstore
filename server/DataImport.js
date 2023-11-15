import express from 'express';
import asyncHandler from 'express-async-handler';

import User from './Models/UserModel.js';
import users from './data/User.js';
import brands from './data/Brands.js';
import Brand from './Models/BrandModel.js';
import Category from './Models/CategoryModel.js';
import categorys from './data/Categorys.js';
import Promotion from './Models/PromotionModel.js';
import promotions from './data/Promotion.js'
import Product from './Models/ProductModel.js';
import products from './data/Products.js';

const ImportData = express.Router();

ImportData.post(
    "/user", 
    asyncHandler(async (req, res) => {
        const importUser = await User.insertMany(users);
        res.send({importUser});
    }
)
);

ImportData.post(
    "/brands", 
    asyncHandler(async (req, res) => {
        // await User.remove({});
        const importBrands = await Brand.insertMany(brands);
        res.send({importBrands});
    })
);

ImportData.post(
    "/categorys",
    asyncHandler(async (req, res) => {
        // await Category.remove();
        const importCategorys = await Category.insertMany(categorys);
        res.send({importCategorys});
    })
);

ImportData.post(
    "/promotions",
    asyncHandler(async (req, res) => {
        const importPromo = await Promotion.insertMany(promotions);
        res.send({importPromo});
    })
);

ImportData.post(
    "/products",
    asyncHandler(async (req, res) => {
        const importProduct = await Product.insertMany(products);
        res.send({importProduct});
    })
)

export default ImportData;