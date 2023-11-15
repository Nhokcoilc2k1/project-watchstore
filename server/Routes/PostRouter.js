import express from 'express';
import asyncHandler from 'express-async-handler';
import Post from '../Models/PostModel.js';
import protect from '../Middleware/AuthMiddleware.js';

const postRoute = express.Router();

postRoute.post(
    "/",
    asyncHandler(async(req, res) => {
        const {title,content, description} = req.body;
        if(!title || !content || !description) throw new Error('Missing input');
        const postdExit = await Post.findOne({title});
        if(postdExit){
            res.status(400);
            throw new Error("Post name already exist");
        }else{
            const post = new Post({
                title,
                description,
                content,
            });
            if(post){
                const createPost = await post.save();
                res.status(201).json(createPost);
            }else{
                res.status(400);
                throw new Error("Invalid brand data");
            }
        }
    })
)

postRoute.put(
    "/:id",
    asyncHandler(async(req, res) => {
        const {title,content,status, image, description} = req.body;
        const post = await Post.findById(req.params.id);
        if(post){
            post.title = title;
            post.content = content;
            post.image = image;
            post.description = description;
            post.status = status;

            const updatePost = await Post.save();
            res.json(updatePost);
        }else{
            res.status(404);
            throw new Error('Post not found');
        }
    })
)

postRoute.delete(
    "/:id",
    asyncHandler(async(req, res) => {
        const deletePost = await Post.findByIdAndDelete(req.params.id);
        if(deletePost){
            res.status(200).json('Delete successful');
        }else{
            res.status(404);
            throw new Error('Unsuccesful');
        }
    })
)

postRoute.get(
    "/",
    asyncHandler(async(req, res) => {
        const queries = {...req.query};
        const excludeFields = ['limit', 'sort', 'page', 'fields'];
        excludeFields.forEach(el => delete queries[el]);
        let queryString = JSON.stringify(queries);
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`);
        const formatedQueries = JSON.parse(queryString);

        if(queries?.name) formatedQueries.name = {$regex: queries.name, $options: 'i'}
        let queryCommand = Post.find(formatedQueries);

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
            const counts = await Post.find(formatedQueries).countDocuments();
            return res.status(200).json({
              success: response ? true : false,
              posts: response ? response : 'Cannot get posts',
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

export default postRoute;