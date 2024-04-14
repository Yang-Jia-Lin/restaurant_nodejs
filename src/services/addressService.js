// src/services/AddressService.js

const Address = require('../dbModels/addressModel'); // 确保路径正确
const AddressService = {
    getAllAddress: async () => {
        try {
            return await Address.findAll({
                order: [['address_id', 'ASC']] // 按sequence升序排序
            });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = AddressService;