import { Guild, GuildMember, User, UserPremiumType } from "discord.js"
import format from "./format"
import moment from "moment"

export default {
	bar(min: number, current: number, max: number, length = 10, border = false, chars = [`#`, `.`, `[`, `]`]) {
		const progress = (current - min) / (max - min)

		const count = Math.floor(progress * length)
		console.log(progress)
		console.log(length)
		console.log(`min: ${min}, current: ${current}, max: ${max}, length: ${length}, chars: ${chars}, progress: ${progress}, count: ${count}`)
		let bar = `${chars[0].repeat(count)}${chars[1].repeat(length - count)}`
		if (border) bar = `${chars[2]}${bar}${chars[3]}`
		return bar
	},
	numberCommas(n = 0) {
		return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	},
	async getJSONResponse(body) {
		let fullBody = ''

		for await (const data of body) {
			fullBody += data.toString()
		}

		return JSON.parse(fullBody)
	},
	time(ms: number) {
		// this isn't really accurate because of how days work
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
	/**
	 * Get the difference between two dates, as a string in format x years, y months, z days
	 *
	 * @param {moment.Moment} timea The later time (or it'll be negative. im sorry)
	 * @param {moment.Moment} timeb The earlier time
	 * @return {string} Returns a string
	 */
	timeDiff(timea: moment.Moment, timeb: moment.Moment) {

		var years = timea.diff(timeb, 'year');
		timeb.add(years, 'years');

		var months = timea.diff(timeb, 'months');
		timeb.add(months, 'months');

		var days = timea.diff(timeb, 'days');

		var output = ""
		if (years) output += format.pluralize(years, "year") + ", "
		if (months) output += format.pluralize(months, "month") + ", "
		output += format.pluralize(days, "day")

		return output
	},
	pluralize(number: number, string: string, suffix = 's') {
		return `${number} ${string}${number !== 1 ? suffix : ''}`
	},
	/**
	 * split text up
	 *
	 * @param {string} text
	 * @param {number} [maxLength=2000] maximum length of 1 message
	 * @param {string | string[]} [char='\n'] character to split on
	 * @param {string} [prepend=''] prepend to every message (i dont think it does it to the first message)
	 * @param {string} [append=''] append to every message (i dont think it does it to the last one)
	 * @return {*} 
	 */
	splitMessage(text: string, maxLength = 2000, char = '\n', prepend = '', append = ''): string[] {
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
		if (splitText.some(elem => elem.length > maxLength)) { // if it couldn't be split properly, try again but without the specific characters
			console.log("no splittable characters that make me happy")
			splitText = [];
			for (let i = 0; i < text.length; i += maxLength - 10) {
				splitText.push(text.slice(i, i + maxLength - 10));
			}
		}
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
	},
	cutToLength(text: string, length: number) {
		if (text.length > length) {
			text = text.substring(0, length - 1) + "...";
		}
		return text
	},
	shittyUsername(user: User) {
		if (user.discriminator == "0") {
			return user.username
		} else {
			return `${user.username}#${user.discriminator}`
		}
	},
	// displayName(user: any) {
	// 	if (user.guild) {
	// 		console.log(user)
	// 		console.log("guild")
	// 		if (user.nickname) {
	// 			return user.nickname
	// 		}
	// 		else if (user.displayName) {
	// 			return user.displayName
	// 		} else {
	// 			return user.username
	// 		}
	// 	} else {
	// 		console.log("not guild")
	// 		if (user.displayName) {
	// 			return user.displayName
	// 		} else {
	// 			return user.username
	// 		}
	// 	}
	// },
	async pronouns(user: GuildMember) {
		const roles = (await user.fetch()).roles
		const pronouns = roles.cache.filter(role => {
			switch (role.name.replace(" ", "").toLowerCase()) {
				case "she/her": {
					return "she/her"
				}
				case "he/him": {
					return "he/him"
				}
				case "they/them": {
					return "they/them"
				}
			}
		}
		).random()
		return pronouns
	},
	// markdownEscape(text: string) {
	// 	var unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
	// 	var escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
	// 	// return text.replace(/((\_|\*|\~|\`|\|){1,2})/g, '\\$1');
	// 	return escaped
	// },
	markdownEscape(string: string, skips: string[] = []): string {
		var unescaped = string.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character

		const replacements: [RegExp, string, string][] = [
			[/\*/g, '\\*', 'asterisks'],
			[/#/g, '\\#', 'number signs'],
			[/\//g, '\\/', 'slashes'],
			[/_/g, '\\_', 'underscores'],
			[/`/g, '\\`', 'codeblocks'],
			[/~/g, '\\~', 'strikethroughs']
		];

		return replacements.reduce((result, replacement) => {
			const name = replacement[2];
			return name && skips.includes(name) ? result : result.replace(replacement[0], replacement[1]);
		}, unescaped);
	},
	async usernameBrackets(user: User) {
		return `${user.username} (${user.displayName})`
	},
	removeDiscrimForNewUsernames(text: string) {
		if (text.endsWith("#0")) {
			return text.substring(0, text.length - 2)
		} else {
			return text
		}
	}
}