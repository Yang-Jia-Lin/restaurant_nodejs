const CarouselImage = require('../dbModels/carouselImagesModel');

const carouselImagesService = {
    getAllCarouselImages: async () => {
        try {
            return await CarouselImage.findAll({
                order: [['sequence', 'ASC']] // 按sequence升序排序
            });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = carouselImagesService;