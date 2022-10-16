module.exports = {
	bar(min, current, max, length = 10, chars = [`#`, `.`]) {
		progress = (current - min) / (max - min)

		count = Math.floor(progress * length)
		console.log(progress)
		console.log(length)
		console.log(`min: ${min}, current: ${current}, max: ${max}, length: ${length}, chars: ${chars}, progress: ${progress}, count: ${count}`)
		return `${chars[0].repeat(count)}${chars[1].repeat(length - count)}`
	},
	numberCommas(n) {
		return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	},
	async getJSONResponse(body) {
		let fullBody = ''

		for await (const data of body) {
			fullBody += data.toString()
		}

		return JSON.parse(fullBody)
	}
}