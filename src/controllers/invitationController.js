const express = require('express');
const router = express.Router();
const invitationService = require('../services/invitationService');

// 创建邀请
router.post('/create', async (req, res) => {
    const inviterId = req.body.inviterId; // 从请求体中获取邀请者ID
    const inviteeId = req.body.inviteeId; // 从请求体中获取被邀请者ID

    try {
        // 检查被邀请者是否已经被邀请
        const alreadyInvited = await invitationService.checkIfInviteeInvited(inviteeId);
        if (alreadyInvited) {
            return res.status(202).json({ message: "Invitee has already been invited." });
        }

        // 创建邀请记录
        const invitation = await invitationService.createInvitation(inviterId, inviteeId);
        return res.status(200).json(invitation);
    } catch (error) {
        console.error("Create Invitation caught an error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// 更新邀请进度1
router.post('/updateInviteStatus', async (req, res) => {
    const inviteeId = req.body.inviteeId; // 从请求体中获取被邀请者ID
    const status = req.body.status;
    try {
        const alreadyInvited = await invitationService.checkIfInviteeInvited(inviteeId);
        if (!alreadyInvited) {
            return res.status(202).json({ message: "Invitee has not been invited." });
        }

        // 更新邀请记录
        const inviteUpdate = await invitationService.updateInvitationStatus(inviteeId, status);
        return res.status(200).json(inviteUpdate);
    } catch (error) {
        console.error("Update Invitation caught an error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// 邀请进度2
router.post('/completeInvite', async (req, res) => {
    const inviteeId = req.body.inviteeId;
    const status = req.body.status;
    try {
        // 有记录
        const alreadyInvited = await invitationService.checkIfInviteeInvited(inviteeId);
        if (!alreadyInvited) {
            return res.status(400).json({ message: "Invitee has not been invited." });
        }

        // 状态正确
        const inviteStatus = await invitationService.checkInviteStatus(inviteeId);
        if (inviteStatus!=='registered') {
            return res.status(202).json({ message: "Invitee has not been register." });
        }

        // 更新状态
        const inviteUpdate = await invitationService.updateInvitationStatus(inviteeId, status);

        // 完成后续
        await invitationService.completeInvitation(inviteeId)

        // 返回结果
        return res.status(200).json(inviteUpdate);
    } catch (error) {
        console.error("Update Invitation caught an error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;