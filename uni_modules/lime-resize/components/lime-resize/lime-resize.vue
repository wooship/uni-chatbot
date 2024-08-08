<template>
	<demo-block title="resize" type="ultra">
		<demo-block title="监听父级">
			<view class="parent" :style="[pStyles]">
				<l-resize @resize="handleResize($event, 'parent')"></l-resize>
			</view>
			<button @click="onclick('parent')">变变</button>
		</demo-block>
		<demo-block title="监听子级">
			<l-resize @resize="handleResize($event, 'child')">
				<view class="child" :style="[cStyles]"></view>
			</l-resize>
			<button @click="onclick('child')">变变</button>
		</demo-block>
	</demo-block>
</template>
<script>
	import { ref, reactive , defineComponent, computed } from '../l-resize/vue'
	export default defineComponent({
		setup() {
			const store = reactive({
				parent: {
					width: 100,
					height: 100
				},
				child: {
					width: 100,
					height: 100
				}
			})
			const pStyles = computed(() => {
				return `width: ${store.parent.width}px; height: ${store.parent.height}px`
			})
			const cStyles = computed(() => {
				return `width: ${store.child.width}px; height: ${store.child.height}px`
			})
	
			const handleResize = (size, type) => {
				uni.showToast({
					icon: "none",
					title: `我是 ${type} 我变了 ${size.width}`,
					duration: 1000
				})
			}
			const onclick = (type) => {
				const target = store[type]
				setTimeout(() => {
					target.width = 200
					target.height = 200
				}, 1000)
				setTimeout(() => {
					target.width = 300
					target.height = 300
				}, 2500)
				setTimeout(() => {
					target.width = 100
					target.height = 100
				}, 4000)
			}
			return {
				pStyles,
				cStyles,
				handleResize,
				onclick
			}
		}
	})
</script>
<style>
	.parent {
		position: relative; 
		background-color: yellowgreen;
	}
	.child {
		background-color: #4d80f0;
	}
</style>