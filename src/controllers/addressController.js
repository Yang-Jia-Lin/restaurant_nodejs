const express = require('express');
const addressService = require('../services/addressService');
const router = express.Router();

// 获取所有地址
router.get('/', async (req, res) => {
    try {
        const addresses = await addressService.getAllAddress();
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;