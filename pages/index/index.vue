<template>
	<view :style="{ height: sHeight + 'px' }" @touchstart="" @touchmove="touch_move" @touchend="">
		<view class="tips color_fff size_12 align_c" :class="{ 'show':ajax.loading }" @tap="getHistoryMsg">
			{{ajax.loadText}}
		</view>
		<view class="box-1" id="list-box" :style="{ 'padding-bottom': pBottom + 'px' }">
			<view class="talk-list parent" style="position: relative; ">
				<l-resize @resize="handleResize"></l-resize>
				<view v-for="(item,index) in talkList" :key="index" :id="`msg-${item.id}`">
					<view class="item flex_col" :class=" item.type == 1 ? 'push':'pull' ">
						<image :src="item.pic" mode="aspectFill" class="pic"></image>
						<view class="content">
							<!-- <text user-select>{{item.content}}</text> -->
							<zero-markdown-view :themeColor="themeColor" :markdown="item.content"></zero-markdown-view>
							<!-- <typer :content="item.content"></typer> -->
							<image :src="item.pic_base64" mode="widthFix" @tap="imgPreview(item.pic_base64)"
								:class=" item.pic_base64 ? 'pic_base64':'pic_base64_none' "></image>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="box-2" :style="{ bottom: bottom }">
			<view class="flex_col">
				<view class="flex_grow">
					<input type=" text" class="content" v-model="content" confirm-type="send" @confirm="send"
						placeholder="请输入你的问题" :adjust-position="false" placeholder-style="color:#DDD;"
						cursor-spacing="155rpx" always-embed="true" @blur="blur_input" @focus="focus_input">
				</view>
				<button class="camera" @tap="eye">
					<uni-icons :type="eye_icon" size="24" />
				</button>
				<button class="camera" @tap="camera">
					<uni-icons :type="pic_icon" size="24" />
				</button>
				<button class="send" @tap="send">发送</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getParamsRequest,
		getTimeOut,
		createCanvas,
		imgScaleW
	} from "../../apis/index.js"
	import {
		pathToBase64,
		base64ToPath
	} from 'image-tools'
	export default {
		usingComponents: {
			'typer': '@/componets/typer/typer.vue'
		},
		data() {
			return {
				talkList: [],
				ajax: {
					rows: 1, //每页数量
					page: 1, //页码
					flag: true, // 请求开关
					loading: true, // 加载中
					loadText: '正在获取信息'
				},
				content: '',
				bottom: '',
				sHeight: '',
				pBottom: '',
				canClick: true,
				pic_icon: 'camera',
				pic_base64: '',
				themeColor: '#2d85b1',
				eye_icon: 'eye',
				eye_open: false
			}
		},
		/*  #ifndef  H5  */
		// onPageScroll() {
		// 	uni.hideKeyboard()
		// },
		/*  #endif  */
		onLoad() {
			this.sHeight = uni.getSystemInfoSync().windowHeight - uni.getSystemInfoSync().safeAreaInsets.bottom
			// this.pBottom = 50 + uni.getSystemInfoSync().safeAreaInsets.bottom
			/*  #ifndef  H5  */
			uni.onKeyboardHeightChange((res) => { //监听键盘高度变化
				const res_keyboard = uni.getSystemInfoSync();
				console.log(res.height)
				console.log(res_keyboard.screenHeight)
				console.log(res_keyboard.windowHeight)
				console.log(res_keyboard.safeAreaInsets.bottom)
				let key_height = res.height - res_keyboard.safeAreaInsets.bottom
				this.bottom = `${ key_height>0 ? key_height : 0}px`;
				console.log(this.bottom)
			})
			/*  #endif  */
		},
		// onHide() {
		// 	uni.offKeyboardHeightChange(); //取消监听键盘高度变化事件，避免内存消耗
		// },
		mounted() {
			this.$nextTick(() => {
				this.getHistoryMsg();
			});
			/*  #ifdef  MP-WEIXIN  */
			wx.cloud.init()
			/*  #endif  */
		},
		/* onPageScroll(e) {
			if (e.scrollTop < 5) {
				this.getHistoryMsg();
			}
		}, */
		methods: {
			// 获取历史消息
			getHistoryMsg() {
				if (!this.ajax.flag) {
					return; //
				}

				// 此处用到 ES7 的 async/await 知识，为使代码更加优美。不懂的请自行学习。
				let get = async () => {
					this.hideLoadTips();
					this.ajax.flag = false;
					let data = await this.joinHistoryMsg();

					// console.log('----- 模拟数据格式，供参考 -----');
					// console.log(data); // 查看请求返回的数据结构 

					// 获取待滚动元素选择器，解决插入数据后，滚动条定位时使用
					let selector = '';

					if (this.ajax.page > 1) {
						// 非第一页，则取历史消息数据的第一条信息元素
						selector = `#msg-${this.talkList[0].id}`;
					} else {
						// 第一页，则取当前消息数据的最后一条信息元素
						selector = `#msg-${data[data.length-1].id}`;
					}

					// 将获取到的消息数据合并到消息数组中
					this.talkList = [...data, ...this.talkList];

					// 数据挂载后执行，不懂的请自行阅读 Vue.js 文档对 Vue.nextTick 函数说明。
					this.$nextTick(() => {
						// 设置当前滚动的位置
						this.setPageScrollTo(selector);

						this.hideLoadTips(true);

						if (data.length < this.ajax.rows) {
							// 当前消息数据条数小于请求要求条数时，则无更多消息，不再允许请求。
							// 可在此处编写无更多消息数据时的逻辑
						} else {
							this.ajax.page++;

							// 延迟 200ms ，以保证设置窗口滚动已完成
							setTimeout(() => {
								this.ajax.flag = true;
							}, 200)
						}

					})
				}
				get();
			},
			// 拼接历史记录消息，正式项目可替换为请求历史记录接口
			joinHistoryMsg() {
				let join = () => {
					let arr = [];

					//通过当前页码及页数，模拟数据内容
					let startIndex = (this.ajax.page - 1) * this.ajax.rows;
					let endIndex = startIndex + this.ajax.rows;
					for (let i = startIndex; i < endIndex; i++) {
						arr.push({
							"id": i, // 消息的ID
							// "content": `这是历史记录的第${i+1}条消息`, // 消息内容
							"content": /* "- 今天是" + new Date().toLocaleString() + "\n" + */
								"- 这是一个开源的聊天机器人项目，项目地址：[『点我』](https://github.com/wooship/uni-chatbot)" + "\n" +
								"- 新增**搜索辅助**：点击**相机小图标**左侧的**眼睛小图标**打开或关闭该功能" + "\n" +
								"- **搜索辅助**使用搜索引擎技术为模型提供最新的互联网数据" + "\n" +
								"- **搜索辅助**目前处于测试阶段，该功能与**图文混合输入**不可同时使用" + "\n" +
								"- 支持**图文混合输入**：点击**发送按钮**左侧的**相机小图标**拍摄或选择一张图片" + "\n" +
								"- 该项目目前兼容ios、android、h5，[『下载android版demo』](https://github.com/wooship/uni-chatbot/releases)",
							// "type": Math.random() > 0.5 ? 1 : 0, // 此为消息类别，设 1 为发出去的消息，0 为收到对方的消息,
							"type": 0,
							"pic": "/static/logo.png" // 头像
						})
					}
					/*
						颠倒数组中元素的顺序。将最新的数据排在本次接口返回数据的最后面。
						后端接口按 消息的时间降序查找出当前页的数据后，再将本页数据按消息时间降序排序返回。
						这是数据的重点，因为页面滚动条和上拉加载历史的问题。
					 */
					arr.reverse();

					return arr;
				}

				// 此处用到 ES6 的 Promise 知识，不懂的请自行学习。
				return new Promise((done, fail) => {
					// 无数据请求接口，由 setTimeout 模拟，正式项目替换为 ajax 即可。
					setTimeout(() => {
						let data = join();
						done(data);
					}, 1500);
				})
			},
			// 设置页面滚动位置
			setPageScrollTo(selector) {
				let view = uni.createSelectorQuery().in(this).select(selector);
				view.boundingClientRect((res) => {
					uni.pageScrollTo({
						scrollTop: res.top - 30, // -30 为多显示出大半个消息的高度，示意上面还有信息。
						duration: 0
					});
				}).exec();
			},
			// 隐藏加载提示
			hideLoadTips(flag) {
				if (flag) {
					this.ajax.loadText = '连接成功';
					setTimeout(() => {
						this.ajax.loading = false;
					}, 300);
				} else {
					this.ajax.loading = true;
					this.ajax.loadText = '初始化连接';
				}
			},
			// 发送信息
			send() {
				if (!this.canClick) {
					console.log(this.canClick)
					return
				}
				if (this.content.trim() === '') {
					uni.showToast({
						title: '请输入有效的内容',
						icon: 'none'
					})
					return;
				}
				this.canClick = false

				// let question = '本次会话你我的聊天记录如下：\n{\n'
				// for (let i = 0; i < this.talkList.length; i++) {
				// 	if (this.talkList[i].type === 0) {
				// 		question += '你：' + this.talkList[i].content + '\n'
				// 	} else {
				// 		question += '我：' + this.talkList[i].content + '\n'
				// 	}
				// }
				// question += '}\n现在我的问题是：\n'
				// question += this.content.trim() + '\n';
				// console.log(question)
				let prompt = "You play my personal assistant and do your best to answer my questions. " +
					"If you don't know the answer to the question, you can search and organize the information yourself. " +
					"Even so, if you still can't get the answer, please tell me honestly and don't talk nonsense. " +
					"Please answer in Chinese (unless I explicitly request another language in the question). " +
					"My question is as follows:\n"
				let jsonq = {
					q: prompt + this.content.trim(),
					e: this.eye_open,
					p: this.pic_base64
				}
				let question = JSON.stringify(jsonq)
				// uni.showLoading({
				// 	title: '正在发送'
				// })
				/*  #ifdef  MP-WEIXIN  */
				wx.cloud.callFunction({ //调用云服务
						name: "askquestion", //云函数名称
						data: {
							q: question, //云函数需要的参数
						},
					})
					.then(res => {
						console.log(res);
						// let intervalID = setInterval((_q) => {
						// 	let st = new Date().getTime()
						// 	wx.cloud.callFunction({ //调用云服务
						// 			name: "getanswer", //云函数名称
						// 			data: {
						// 				q: _q, //云函数需要的参数
						// 			},
						// 		})
						// 		.then(res => {
						// 			let t = new Date().getTime()
						// 			if (t - st < 3000) {
						// 				console.log(res);
						// 				if (res.result == 'no answer yet') {
						// 					// console.log('awaiting answer ...')
						// 				} else {
						// 					let data = {
						// 						"id": new Date().getTime(),
						// 						"content": res.result,
						// 						"type": 0,
						// 						"pic": "/static/logo.png"
						// 					}
						// 					this.talkList.push(data);

						// 					this.$nextTick(() => {
						// 						if (this.bottom === '0px' || this.bottom ===
						// 							'') {
						// 							uni.pageScrollTo({
						// 								scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
						// 								duration: 0
						// 							});
						// 						}
						// 					})

						// 					clearInterval(intervalID);
						// 				}
						// 			} else {
						// 				console.log('get answer timeout :', t - st)
						// 			}
						// 		})
						// 		.catch(err => {
						// 			console.log('失败', res)
						// 		})
						// }, 4000, question);
						this.getAnswerWx(question)
					})
					.catch(err => {
						setTimeout(() => {
							// uni.hideLoading();

							// 将当前发送信息 添加到消息列表。
							let data = {
								"id": new Date().getTime(),
								"content": '问题发送失败，请稍后重试：\n' + err,
								"type": 0,
								"pic": "/static/logo.png"
							}
							this.talkList.push(data);

							// this.$nextTick(() => {
							// 	if (this.bottom === '0px' || this.bottom === '') {
							// 		uni.pageScrollTo({
							// 			scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
							// 			duration: 0
							// 		});
							// 	}
							// })
						}, 1000);
					})
				/*  #endif  */
				/*  #ifndef  MP-WEIXIN  */
				getParamsRequest("/postquestion", {
						q: question
					}, false, "POST")
					.then(res => {
						console.log(res);
						// let intervalID = setInterval((_q) => {
						// 	let st = new Date().getTime()
						// 	getParamsRequest("/postanswer", {
						// 			q: _q
						// 		}, false, "POST")
						// 		.then(res => {
						// 			let t = new Date().getTime()
						// 			if (t - st < 3000) {
						// 				console.log(res);
						// 				if (res == 'no answer yet') {
						// 					// console.log('awaiting answer ...')
						// 				} else {
						// 					let data = {
						// 						"id": new Date().getTime(),
						// 						"content": res,
						// 						"type": 0,
						// 						"pic": "/static/logo.png"
						// 					}
						// 					this.talkList.push(data);

						// 					this.$nextTick(() => {
						// 						// console.log(this.bottom)
						// 						if (this.bottom === '0px' || this
						// 							.bottom ===
						// 							'') {
						// 							uni.pageScrollTo({
						// 								scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
						// 								duration: 0
						// 							});
						// 						}
						// 					})

						// 					clearInterval(intervalID);
						// 				}
						// 			} else {
						// 				console.log('get answer timeout :', t - st)
						// 			}
						// 		})
						// 		.catch(err => {
						// 			console.log(err);
						// 		})
						// }, 4000, question);
						this.getAnswer(question)
					})
					.catch(err => {
						setTimeout(() => {
							// uni.hideLoading();

							// 将当前发送信息 添加到消息列表。
							let data = {
								"id": new Date().getTime(),
								"content": '问题发送失败，请稍后重试：\n' + err,
								"type": 0,
								"pic": "/static/logo.png"
							}
							this.talkList.push(data);

							// this.$nextTick(() => {
							// 	if (this.bottom === '0px' || this.bottom === '') {
							// 		uni.pageScrollTo({
							// 			scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
							// 			duration: 0
							// 		});
							// 	}
							// })
						}, 1000);
					})
				/*  #endif  */

				setTimeout(() => {
					// uni.hideLoading();

					// 将当前发送信息 添加到消息列表。
					let data
					if (this.pic_base64 !== '') {
						data = {
							"id": new Date().getTime(),
							"content": this.content,
							"type": 1,
							"pic": "/static/question.png",
							"pic_base64": this.pic_base64
						}
					} else {
						data = {
							"id": new Date().getTime(),
							"content": this.content,
							"type": 1,
							"pic": "/static/question.png"
						}
					}
					this.talkList.push(data);

					this.$nextTick(() => {
						this.pic_icon = 'camera' //改
						this.pic_base64 = '' //改
						// 清空内容框中的内容
						this.content = '';
						this.canClick = true
						// uni.pageScrollTo({
						// 	scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
						// 	duration: 0
						// });
					})
				}, 100);
			},
			//input失去焦点时滚到底，为了解决虚拟键盘收回时滚动条位置不对的问题
			blur_input() {
				// setTimeout(() => {
				// 	uni.pageScrollTo({
				// 		scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
				// 		duration: 0
				// 	});
				// }, 300);
			},
			focus_input() {
				// setTimeout(() => {
				// 	uni.pageScrollTo({
				// 		scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
				// 		duration: 0
				// 	});
				// }, 800);
			},
			touch_move() {
				uni.hideKeyboard()
			},
			eye() {
				if(this.pic_base64 !== ''){
					uni.showToast({
						title: '要使用搜索辅助请先关闭图文混合输入',
						icon: 'none'
					})
					return
				}
				if (this.eye_open){
					this.eye_icon = 'eye'
					this.eye_open = false
					uni.showToast({
						title: '关闭搜索辅助功能',
						icon: 'none'
					})
				}else{
					this.eye_icon = 'eye-filled'
					this.eye_open = true
					uni.showToast({
						title: '打开搜索辅助功能',
						icon: 'none'
					})
				}
			},
			camera() {
				if(this.eye_open){
					uni.showToast({
						title: '要使用图文混合输入请先关闭搜索辅助',
						icon: 'none'
					})
					return
				}
				if (this.pic_base64 !== '') {
					this.pic_base64 = ''
					this.pic_icon = 'camera'
					uni.showToast({
						title: '取消选择图片',
						icon: 'none'
					})
				} else {
					uni.chooseImage({
						count: 1, //上传图片数量
						sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
						sourceType: ['album', 'camera'], //album 从相册选图，camera 使用相机，默认二者都有
						success: (chooseImageRes) => {
							console.log('chooseImageRes', JSON.stringify(chooseImageRes));
							// tempFilePaths 图片的本地文件路径列表
							const tempFilePaths = chooseImageRes.tempFilePaths;
							// console.log(tempFilePaths[0])
							/*  #ifdef MP-WEIXIN  */
							uni.compressImage({
								src: tempFilePaths[0],
								quality: 10,
								success: (res) => {
									console.log(JSON.stringify(res))
									pathToBase64(res.tempFilePath).then(data => {
										this.pic_base64 = data;
										this.pic_icon = 'camera-filled';
										uni.showToast({
											title: '已选择一张图片',
											icon: 'none'
										})
										// console.log(this.pic_base64);
									})
								}
							})
							/*  #endif  */
							/*  #ifdef APP-PLUS  */
							plus.zip.compressImage({
								src: tempFilePaths[0],
								dst: tempFilePaths[0],
								width: '40%',
								height: '40%',
								quality: 10,
								overwrite: true,
							}, (event) => {
								let newImg = event.target
								// console.log(newImg)
								pathToBase64(newImg).then(data => {
									this.pic_base64 = data;
									this.pic_icon = 'camera-filled';
									uni.showToast({
										title: '已选择一张图片',
										icon: 'none'
									})
									// console.log(this.pic_base64);
								})
							}, function(err) {
								//err
								console.log(err)
							})
							/*  #endif  */
							/*  #ifdef H5  */
							let canvas = createCanvas();
							let ctx = canvas.getContext("2d");
							let targeImg = new Image();
							targeImg.src = tempFilePaths[0];
							uni.getImageInfo({
								src: tempFilePaths[0],
								success: (i) => {
									let imgScale = imgScaleW(1024, i.width, i.height);
									canvas.width = imgScale.width;
									canvas.height = imgScale.height;
									ctx.drawImage(targeImg, 0, 0, imgScale.width, imgScale.height);
									canvas.toBlob((blob) => {
										// console.log(blob)
										let imgSrc = window.URL.createObjectURL(blob)
										pathToBase64(imgSrc).then(data => {
											// console.log(data)
											this.pic_base64 = data;
											this.pic_icon = 'camera-filled';
											uni.showToast({
												title: '已选择一张图片',
												icon: 'none'
											})
										})
									})
								}
							})
							/*  #endif  */
						}
					});
				}
			},
			// formatAnswer(answser){
			// 	const block_regex = /^BlockReason/
			// 	const fail_regex = /^content generation failed/
			// 	if(block_regex.test(answser)){
			// 		return '基于安全、隐私政策等原因，您的问题被拒绝回答...'
			// 	}else if(fail_regex.test(answser)){
			// 		return '服务器异常，请稍后重试...'
			// 	}else{
			// 		return answser
			// 	}
			// },
			getAnswerWx(question) {
				setTimeout(() => {
					wx.cloud.callFunction({ //调用云服务
							name: "getanswer", //云函数名称
							data: {
								q: question, //云函数需要的参数
							},
						})
						.then(res => {
							console.log(res);
							if (res == 'no answer yet') {
								// console.log('awaiting answer ...')
								this.getAnswerWx(question)
							} else {
								let data = {
									"id": new Date().getTime(),
									"content": res,
									"type": 0,
									"pic": "/static/logo.png"
								}
								this.talkList.push(data);

								// this.$nextTick(() => {
								// 	// console.log(this.bottom)
								// 	if (this.bottom === '0px' || this
								// 		.bottom ===
								// 		'') {
								// 		uni.pageScrollTo({
								// 			scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
								// 			duration: 0
								// 		});
								// 	}
								// })
							}
						})
						.catch(err => {
							console.log(err);
						})
				}, 1000)
			},
			getAnswer(question) {
				setTimeout(() => {
					getParamsRequest("/postanswer", {
							q: question
						}, false, "POST")
						.then(res => {
							console.log(res);
							if (res == 'no answer yet') {
								// console.log('awaiting answer ...')
								this.getAnswer(question)
							} else {
								let data = {
									"id": new Date().getTime(),
									"content": res,
									"type": 0,
									"pic": "/static/logo.png"
								}
								this.talkList.push(data);

								// this.$nextTick(() => {
								// 	// console.log(this.bottom)
								// 	if (this.bottom === '0px' || this
								// 		.bottom ===
								// 		'') {
								// 		uni.pageScrollTo({
								// 			scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
								// 			duration: 0
								// 		});
								// 	}
								// })
							}
						})
						.catch(err => {
							console.log(err);
						})
				}, 1000)
			},
			imgPreview(img) {
				let base64Arr = [img]
				base64Arr.reduce((promise, path) => promise.then(res => base64ToPath(path).then(base64 => (res.push(
						base64), res))), Promise.resolve([]))
					.then(res => {
						// 临时url
						// console.log(res)
						uni.previewImage({
							current: 0,
							urls: res
						});
					})
					.catch(error => {
						console.error(error)
					})
			},
			handleResize(event) {
				let pb
				uni.createSelectorQuery().select('.box-2').boundingClientRect(function(rect) {
					pb = rect.height + uni.getSystemInfoSync().safeAreaInsets.bottom - uni.getSystemInfoSync()
						.safeAreaInsets.bottom
					// console.log("pb",pb)
				}).exec();
				setTimeout(() => {
					this.pBottom = pb
					console.log("pbottom", this.pBottom)
				}, 300);
				// alert(event)
				/*  #ifndef  H5  */
				// if (!(this.bottom === '0px' || this
				// 		.bottom ===
				// 		'')) {
				// 	return;
				// }
				/*  #endif  */
				this.$nextTick(() => {
					setTimeout(() => {
						uni.pageScrollTo({
							scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
							duration: 0
						});
					}, 100);
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "../../lib/global.scss";

	page {
		background-color: #F3F3F3;
		font-size: 28rpx;
		//兼容iphone X ios 12.4
		padding-bottom: env(safe-area-inset-bottom);
	}

	text {
		//设置文字可选择复制
		-webkit-user-select: text;
	}

	/* 加载数据提示 */
	.tips {
		position: fixed;
		left: 0;
		top: var(--window-top);
		width: 100%;
		z-index: 9;
		background-color: rgba(0, 0, 0, 0.15);
		height: 72rpx;
		line-height: 72rpx;
		transform: translateY(-80rpx);
		transition: transform 0.3s ease-in-out 0s;

		&.show {
			transform: translateY(0);
		}
	}

	.box-1 {
		width: 100%;
		height: auto;
		// padding-bottom: 100rpx;
		box-sizing: content-box;

		/* 兼容iPhoneX，你这错了，没用还会有反效果 */
		// margin-bottom: 0;
		// margin-bottom: constant(safe-area-inset-bottom);
		// margin-bottom: env(safe-area-inset-bottom);
	}

	.box-2 {
		position: fixed;
		left: 0;
		width: 100%;
		bottom: 0;
		height: auto;
		z-index: 2;
		border-top: #e5e5e5 solid 1px;
		box-sizing: content-box;
		background-color: #F3F3F3;

		/* 兼容iPhoneX */
		padding-bottom: 0;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		>view {
			padding: 0 20rpx;
			height: 100rpx;
		}

		.content {
			background-color: #fff;
			height: 64rpx;
			padding: 0 20rpx;
			border-radius: 10rpx;
			font-size: 28rpx;
		}

		.send {
			background-color: #448cb6;
			color: #fff;
			height: 64rpx;
			margin-left: 10rpx;
			border-radius: 10rpx;
			padding: 0;
			width: 120rpx;
			line-height: 62rpx;

			&:active {
				background-color: #316684;
			}
		}

		.camera {
			// background-color: #448cb6;
			color: #fff;
			height: 64rpx;
			margin-left: 10rpx;
			border-radius: 10rpx;
			padding: 0;
			width: 64rpx;
			line-height: 62rpx;

			// &:active {
			// 	background-color: #316684;
			// }
		}
	}

	.talk-list {
		padding-bottom: 20rpx;

		/* 消息项，基础类 */
		.item {
			padding: 20rpx 20rpx 0 20rpx;
			align-items: flex-start;
			align-content: flex-start;
			color: #333;

			.pic {
				width: 92rpx;
				height: 92rpx;
				border-radius: 50%;
				border: #fff solid 1px;
			}

			.pic_base64 {
				// width: 100%;
				min-width: 400rpx;

				:hover {
					cursor: pointer;
				}

				// height: 256rpx;
				// max-width: 1024rpx;
				// max-height: 1024rpx;
				// border: #fff solid 1px;
			}

			.pic_base64_none {
				display: none;
			}

			.content {
				padding: 20rpx;
				border-radius: 4px;
				max-width: 73%;
				word-break: break-all;
				line-height: 52rpx;
				position: relative;
			}

			/* 收到的消息 */
			&.pull {
				.content {
					margin-left: 32rpx;
					background-color: #fff;

					&::after {
						content: '';
						display: block;
						width: 0;
						height: 0;
						border-top: 16rpx solid transparent;
						border-bottom: 16rpx solid transparent;
						border-right: 20rpx solid #fff;
						position: absolute;
						top: 30rpx;
						left: -18rpx;
					}
				}
			}

			/* 发出的消息 */
			&.push {
				/* 主轴为水平方向，起点在右端。使不修改DOM结构，也能改变元素排列顺序 */
				flex-direction: row-reverse;

				.content {
					margin-right: 32rpx;
					background-color: #a0e959;

					&::after {
						content: '';
						display: block;
						width: 0;
						height: 0;
						border-top: 16rpx solid transparent;
						border-bottom: 16rpx solid transparent;
						border-left: 20rpx solid #a0e959;
						position: absolute;
						top: 30rpx;
						right: -18rpx;
					}
				}
			}
		}
	}
</style>