const Address = require('../dbModels/addressModel');

const AddressService = {
    // 获取所有地址
    getAllAddress: async () => {
        try {
            return await Address.findAll({
                order: [['address_id', 'ASC']] // 按sequence升序排序
            });
        } catch (error) {
            throw error;
        }
    },

    // 新建地址
    createAddress: async (address) => {
        try {
            // 检查地址是否已存在
            const existingAddress = await Address.findOne({ where: { address_value: address } });
            if (existingAddress) {
                throw new Error('address already exists'); // 主动触发
            }

            // 创建新地址
            return await Address.create({
                address_value: address
            });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = AddressService;