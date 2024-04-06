// src/controllers/carouselImagesController.js

const express = require('express');
const carouselImagesService = require('../services/carouselImagesService');
const router = express.Router();

// 获取所有轮播图
router.get('/', async (req, res) => {
    try {
        const images = await carouselImagesService.getAllCarouselImages();
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;