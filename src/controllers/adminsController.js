// src/controllers/adminsController.js
const express = require('express');
const adminsService = require('../services/adminsService');

const router = express.Router();

// 管理员注册
router.post('/register', async (req, res) => {
    try {
        const { admin_account, admin_password, store_id, role } = req.body;
        const admin = await adminsService.registerAdmin({
            admin_account,
            admin_password,
            store_id,
            role
        });
        res.status(201).json(admin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 管理员登录
router.post('/login', async (req, res) => {
    try {
        const { admin_account, admin_password } = req.body;
        const admin = await adminsService.loginAdmin({
            admin_account,
            admin_password
        });
        res.json(admin);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

module.exports = router;
