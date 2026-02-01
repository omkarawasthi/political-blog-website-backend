const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Blog = require('../models/Blog');

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage Configuration (Cloudinary)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'politics-blog', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

// @route   GET /api/blogs
// @desc    Get all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/blogs/:id
// @desc    Get single blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/blogs
// @desc    Create a new blog with image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, description, category, date } = req.body;

        // Cloudinary file path handling
        let imagePath = null;
        if (req.file) {
            imagePath = req.file.path; // Cloudinary URL
        }

        const newBlog = new Blog({
            title,
            description,
            category,
            date,
            image: imagePath
        });

        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (err) {
        console.error('Error in POST /api/blogs:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
