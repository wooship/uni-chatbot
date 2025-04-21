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
				"content-type": "application/json",
				"Access-Control-Allow-Origin": "*"
			},
			success: (res) => {
				if (res.statusCode == 200) {
					resolve(res.data);
				} else {
					reject("出错了 " + JSON.stringify(res));
				}

			},
			fail: (res) => {
				reject("出错了 " + JSON.stringify(res));
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
	new Promise((resolve, reject) => {
		setTimeout(() => {
			reject('请求超时');
		}, ms);
	})
)

/**
 *  创建画布
 * @returns
 */
export const createCanvas = () => {
	var canvas = document.getElementById('canvas');
	if (!canvas) {
		var canvasTag = document.createElement('canvas');
		canvasTag.setAttribute('id', 'canvas');
		canvasTag.setAttribute('style', 'display:none;'); //隐藏画布
		document.body.appendChild(canvasTag);
		canvas = document.getElementById('canvas');
	}
	return canvas;
}
/**
 * @description 返回图片大小
 * @param {Int} maxWidth
 * @param {Int} width
 * @param {Int} height
 */
export const imgScaleW = (maxWidth, width, height) => {
	var imgScale = {};
	var w = 0;
	var h = 0;
	if (width <= maxWidth && height <= maxWidth) { // 如果图片宽高都小于限制的最大值,不用缩放
		imgScale = {
			width: width,
			height: height
		};
	} else {
		if (width >= height) { // 如果图片宽大于高
			w = maxWidth;
			h = Math.ceil(maxWidth * height / width);
		} else { // 如果图片高大于宽
			h = maxWidth;
			w = Math.ceil(maxWidth * width / height);
		}
		imgScale = {
			width: w,
			height: h
		};
	}
	return imgScale;
}