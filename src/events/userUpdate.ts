import { Events, Interaction, Message, User, Guild } from 'discord.js';
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"
import format from "../utils/format"
import log from "../utils/log"

// Emitted whenever a user has information changed like username etc
export default new Event({
	name: Events.UserUpdate,
	async execute(olduser: User, newuser: User) {
		console.log(`a user was updated! ${olduser.username} / ${newuser.username}`)
		let o1 = olduser

		let o2 = newuser

		let diff = Object.keys(o2).reduce((diff, key) => {
			if (o1[key] === o2[key]) return diff
			return {
				...diff,
				[key]: o2[key]
			}
		}, {})
		console.log(diff)

		if (format.shittyUsername(olduser) !== format.shittyUsername(newuser)) {
			database.set(`.users.${newuser.id}.usernames.${Date.now()}`, { from: olduser.tag, to: newuser.tag })
		} else {
			// console.log("not saving usernames cuz theyre the same lol")
		}
	},
}
)