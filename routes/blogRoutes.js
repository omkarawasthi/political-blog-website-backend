const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Blog = require('../models/Blog');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
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

        let imagePath = null;
        if (req.file) {
            // Construct accessible URL
            imagePath = `http://localhost:5000/uploads/${req.file.filename}`;
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
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
