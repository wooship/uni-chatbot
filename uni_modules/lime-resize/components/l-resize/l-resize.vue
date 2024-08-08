<template>
	<view class="l-resize l-class" :class="{'l-resize-target': !$slots.default}" :style="[styles]">
		<!--插槽需要脱离父容器文档流，防止父容器固宽固高，进而导致插槽大小被被父容器限制-->
		<view class="l-resize__container l-container-class">
			<!--被监听的插槽-->
			<slot />
			<!--监听插槽变大-->
			<scroll-view class="l-resize__wrapper" scroll-y scroll-x :scroll-top="expandScrollTop"
				:scroll-left="expandScrollLeft" @scroll="onScrollHandler">
				<view class="l-resize__wrapper--placeholder" style="height:100000px;width:100000px;"></view>
			</scroll-view>
			<!--监听插槽变小-->
			<scroll-view class="l-resize__wrapper" scroll-y scroll-x :scroll-top="shrinkScrollTop"
				:scroll-left="shrinkScrollLeft" @scroll="onScrollHandler">
				<view class="l-resize__wrapper--placeholder" style="height:250%;width:250%;"></view>
			</scroll-view>
		</view>
	</view>
</template>
<script lang="ts">
	import { defineComponent, ref, onMounted, getCurrentInstance, computed } from './vue';
	import { getRect } from '@/uni_modules/lime-shared/getRect'
	import { addUnit } from '@/uni_modules/lime-shared/addUnit'
	const name = 'l-resize'
	interface ResizeResult {
	  bottom: number;
	  top: number;
	  left: number;
	  right: number;
	  height: number;
	  width: number;
	}
	export default defineComponent({
		name,
		externalClasses: ['l-class', 'l-container-class'],
		options: {
			addGlobalClass: true,
			virtualHost: true,
		},
		emits: ['resize'],
		setup(_, { emit }) {
			const context = getCurrentInstance()
			const width = ref(0);
			const height = ref(0);
			const expandScrollTop = ref(0);
			const expandScrollLeft = ref(0);
			const shrinkScrollTop = ref(0);
			const shrinkScrollLeft = ref(0);
			let scrollEventCount = 0;
			let lastHeight = 0
			let lastWidth = 0
			let onScrollHandlerClone = null
			let onScrollHandler = () => {
				if (onScrollHandlerClone) {
					onScrollHandlerClone()
				}
			}
			const scrollToBottom = (res : Record<string, number>) => {
				expandScrollTop.value = 100000 + res.height,
					shrinkScrollTop.value = 3 * height.value + res.height,
					expandScrollLeft.value = 100000 + res.width,
					shrinkScrollLeft.value = 3 * width.value + res.width
			}
			const resizeEvent = (res: ResizeResult) => {
				const result = {};
				['bottom', 'top', 'left', 'right', 'height', 'width'].forEach(propName => {
					result[propName] = res[propName];
				});
				emit('resize', result);
			}
			const styles = computed(() => {
				if (context.slots.default) {
					return {
						width: addUnit(width.value),
						height: addUnit(height.value),
					}
				}
				return {}
			})
			onMounted(() => {
				const querySelector = ".l-resize__container";
				const options = { context };

				getRect(querySelector, options).then(res => {
					// 闭包记录容器高度
					lastHeight = res.height
					lastWidth = res.width
					// 立即填充父容器高宽
					width.value = lastWidth
					height.value = lastHeight
					onScrollHandlerClone = () => {
						getRect(querySelector, options).then(res => {
							// 前两次滚动事件被触发，说明 created 的修改已渲染，通知用户代码当前容器大小
							if (scrollEventCount++ === 0) {
								resizeEvent(res as ResizeResult)
							}
							// 滚动条拉到底部会触发两次多余的事件，屏蔽掉。
							if (scrollEventCount < 3) return
							// 手动设置父容器高宽，防止父容器坍塌
							// 滚动完，重新获取容器新的高度
							const newHeight = res.height
							const newWidth = res.width
							// 立即填充父容器高宽
							height.value = newHeight
							width.value = newWidth
							// 宽高都改变时，只需要触发一次 size 事件
							const emitStack = []
							if (newHeight !== lastHeight) {
								lastHeight = newHeight
								emitStack.push(1)
							}
							if (newWidth !== lastWidth) {
								lastWidth = newWidth
								emitStack.push(1)
							}
							if (emitStack.length !== 0) {
								resizeEvent(res as ResizeResult)
							}
							// 滚动条拉到底部（如果使用 nextTick 效果更佳）
							scrollToBottom({ width: lastWidth, height: lastHeight })
						})
					}
					scrollToBottom({ width: lastWidth, height: lastHeight })
				})
			})
			return {
				styles,
				expandScrollTop,
				expandScrollLeft,
				shrinkScrollTop,
				shrinkScrollLeft,
				onScrollHandler
			}
		}
	})
</script>
<style lang="scss">
	@import './index';
</style>