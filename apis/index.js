const BASE_URL = "https://chat.wxwxwxwx.top/api"

/**
 * 封装get请求
 */
export const getParamsRequest = (url, params, showLoading, method) => (
	new Promise((resolve, reject) => {
		if (showLoading) {
			uni.showLoading({
				title: '加载中'
			});
		}
		uni.request({
			url: `${BASE_URL}${url}`,
			method: method,
			data: params,
			header: {
				"content-type": "application/json"
			},
			success: (res) => {
				if (res.statusCode == 200) {
					resolve(res.data);
				} else {
					reject("出错了");
				}

			},
			fail: (res) => {
				reject("出错了");
			},
			complete: () => {
				if (showLoading) {
					uni.hideLoading();
				}
			}
		})
	})
)

/**
 * 超时
 */
export const getTimeOut = (ms) => (
	new Promise((resolve, reject) =>{
		setTimeout(()=> {
			reject('请求超时');
		}, ms);
	})
)
