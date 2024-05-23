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
        const invitee = await User.findOne({ where: { user_id: invitation.invitee } });
        try {
            // 1.赠送积点
            await pointDetailsService.addUserPoints(invitation.inviter, 2, '邀请赠送');

            // 2.发送通知
            const templateId = 'oSA8CXtPkmkXZ0kz_cbkPBlBHiAYMaTFTACyddPvM0I'; // 订阅消息模板ID
            const now = new Date();
            const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const page = 'pages/My/points/points'; // 用户点击消息后跳转的小程序页面
            const data = {
                thing1:{ value: invitee.nickname},
                thing3:{ value: '积点 2个'},
                date2:{ value: formattedDate },
                thing4: { value: '感谢您对本店的支持！欢迎继续分享~'}
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
