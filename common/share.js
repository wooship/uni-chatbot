export default {
	created() {
		/*  #ifdef  MP-WEIXIN  */
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		/*  #endif  */
	},
}