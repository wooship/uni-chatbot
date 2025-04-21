const got = require('got')
const qs = require('querystring')

// 云函数入口函数
exports.main = async (event, context) => {
	// let question = qs.escape(event.q)
	// const response = await got(`https://chat.wxwxwxwx.top/api/getanswer?q=${question}`)
	const response = await got.post('https://chat.wxwxwxwx.top/api/postanswer', {
		json: {
			q: event.q
		}
	})
	return response.body
}