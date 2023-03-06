const BASE_URL = "http://wxwxwxwx.top:3333/api"

/**
 * 封装get请求
 */
export const getParamsRequest = (url, params, showLoading) => (
	new Promise((resolve, reject) => {
		if (showLoading) {
			uni.showLoading({
				title: '加载中'
			});
		}
		uni.request({
			url: `${BASE_URL}${url}`,
			method: "GET",
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
export const getTimeOut = () => (
	new Promise((resolve, reject) =>{
		setTimeout(()=> {
			reject('请求超时');
		}, 50);
	})
)
