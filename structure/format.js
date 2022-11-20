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
	},
	time(ms) {
		const years = Math.floor(ms / 31556952000)
		const yearsms = ms % 31556952000
		const months = Math.floor(yearsms / 2629800000)
		const monthsms = ms % 2629800000
		const days = Math.floor(monthsms / (24 * 60 * 60 * 1000))
		const daysms = ms % (24 * 60 * 60 * 1000)
		const hours = Math.floor(daysms / (60 * 60 * 1000))
		const hoursms = ms % (60 * 60 * 1000)
		const minutes = Math.floor(hoursms / (60 * 1000))
		const minutesms = ms % (60 * 1000)
		const sec = Math.floor(minutesms / 1000)
		output = ``
		if (years) output += `${years} years, `
		if (months) output += `${months} months, `
		if (days) output += `${days} days, `
		if (hours) output += `${hours} hours, `
		output += `${minutes} minutes`
		return output
	}
}