/**
 * @default 渲染视图
 * @param {this} node 节点
 * @param {Object} data 需要渲染的数据
 * @param {Number} delay 延迟多久
 */
export const renderData = (node, data, delay = 0) => {
	const diff = Object.keys(data).reduce((prev, key) => {
		if (data[key] !== node.data[key]) {
			prev[key] = data[key]
		}
		return prev
	}, {})
	if (Object.keys(diff).length === 0) return
	const render = () => node.setData(diff)
	delay ? setTimeout(render, delay) : render()
}