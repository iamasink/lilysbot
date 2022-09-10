module.exports = {
	bar(min, current, max, length = 10, chars = [`#`, `.`]) {
		progress = (current - min) / (max - min)

		count = Math.floor(progress * length)
		console.log(progress)
		console.log(length)
		console.log(`min: ${min}, current: ${current}, max: ${max}, length: ${length}, chars: ${chars}, progress: ${progress}, count: ${count}`)
		return `${chars[0].repeat(count)}${chars[1].repeat(length - count)}`
	}
}