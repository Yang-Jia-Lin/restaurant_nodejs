const express = require('express');
const router = express.Router();
const addressService = require('../services/addressService');

// 获取所有地址
router.get('/', async (req, res) => {
    try {
        const addresses = await addressService.getAllAddress();
        res.json(addresses);
    } catch (error) {
        console.error("Get Address caught an error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// 创建新地址
router.post('/addNew', async (req, res) => {
    try {
        const address = req.body;
        const newAddress = await addressService.createAddress(address);
        res.status(201).json(newAddress);
    } catch (error) {
        console.error("Add new Address caught an error:", error.message);
        res.status(400).json({ message: error.message });
    }
});


module.exports = router;