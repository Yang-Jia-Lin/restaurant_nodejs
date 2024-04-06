// src/services/carouselImagesService.js

const CarouselImage = require('../dbModels/carouselImagesModel'); // 确保路径正确
const carouselImagesService = {
    getAllCarouselImages: async () => {
        try {
            const images = await CarouselImage.findAll({
                order: [['sequence', 'ASC']] // 按sequence升序排序
            });
            return images;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = carouselImagesService;