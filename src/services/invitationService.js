const Invitation = require('../dbModels/invitationModel');
const User = require('../dbModels/usersModel');
const pointDetailsService = require("./pointDetailsService");
const { sendSubscribeMessage } = require('./wechatMessage');

const InvitationService = {
    // 创建邀请记录
    createInvitation: async (inviterId, inviteeId) => {
        try {
            return await Invitation.create({
                inviter: inviterId,
                invitee: inviteeId
            });
        } catch (error) {
            throw error;
        }
    },

    // 查询被邀请者是否已经被邀请
    checkIfInviteeInvited: async (inviteeId) => {
        try {
            const invitation = await Invitation.findOne({ where: { invitee: inviteeId } });
            return invitation !== null;
        } catch (error) {
            throw error;
        }
    },
    checkInviteStatus: async (inviteeId) => {
        try {
            const invitation = await Invitation.findOne({ where: { invitee: inviteeId } });
            return invitation.invitation_status;
        } catch (error) {
            throw error;
        }
    },

    // 修改邀请进度
    updateInvitationStatus: async (inviteeId, status) => {
        try {
            const invitation = await Invitation.findOne({ where: { invitee: inviteeId } });
            return await invitation.update({ invitation_status: status });
        } catch (error) {
            throw error;
        }
    },

    // 完成邀请
    completeInvitation: async (inviteeId) => {
        const invitation = await Invitation.findOne({ where: { invitee: inviteeId } });
        const inviter = await User.findOne({ where: { user_id: invitation.inviter } });
        try {
            // 1.赠送积点
            await pointDetailsService.addUserPoints(invitation.inviter, 2, '邀请赠送');

            // 2.发送通知
            const templateId = 'shRFentLzPN-2o1F3Om1mkYJkbCZXCQUSiZyrf0isns'; // 订阅消息模板ID
            const page = 'pages/My/points/points'; // 用户点击消息后跳转的小程序页面
            const data = {
                number2: { value: 2 },
                thing5: { value: '唐合丰拌面馆-启辰餐厅1层33号窗口' },
                thing6: { value: '您邀请的朋友已成功加入，积点已到账！'}
            };
            await sendSubscribeMessage(inviter.openid, templateId, page, data);

            // 3.更新奖励状态
            await invitation.update({ reward_status: 'rewarded' });
        } catch (error) {
            throw error;
        }
    },

};

module.exports = InvitationService;
