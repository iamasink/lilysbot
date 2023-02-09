export default {
	bar(min, current, max, length = 10, chars = [`#`, `.`]) {
		const progress = (current - min) / (max - min)

		const count = Math.floor(progress * length)
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
		let output = ``
		if (years) output += `${years} years, `
		if (months) output += `${months} months, `
		if (days) output += `${days} days, `
		if (hours) output += `${hours} hours, `
		output += `${minutes} minutes`
		return output
	},
	splitMessage(text, maxLength = 2000, char = '\n', prepend = '', append = '') {


		if (text.length <= maxLength) return [text]
		let splitText = [text]
		if (Array.isArray(char)) {
			while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
				const currentChar = char.shift()
				if (currentChar instanceof RegExp) {
					splitText = splitText.flatMap(chunk => chunk.match(currentChar))
				} else {
					splitText = splitText.flatMap(chunk => chunk.split(currentChar))
				}
			}
		} else {
			splitText = text.split(char)
		}
		if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN')
		const messages = []
		let msg = ''
		for (const chunk of splitText) {
			if (msg && (msg + char + chunk + append).length > maxLength) {
				messages.push(msg + append)
				msg = prepend
			}
			msg += (msg && msg !== prepend ? char : '') + chunk
		}
		return messages.concat(msg).filter(m => m)
	}
}