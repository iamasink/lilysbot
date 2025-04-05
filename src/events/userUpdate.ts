import { Events, Interaction, Message, User, Guild } from "discord.js"
import Event from "../types/Event"
import database from "../utils/database"
import format from "../utils/format"
import log from "../utils/log"
import user from "../utils/user"

// Emitted whenever a user has information changed like username etc
export default new Event({
	name: Events.UserUpdate,
	async execute(olduser: User, newuser: User) {
		// console.log(		 	`a user was updated! ${olduser.username} / ${newuser.username}`,		 )
		let o1 = olduser

		let o2 = newuser

		// calculate the differences between the new and old user
		let diff = Object.keys(o2).reduce((diff, key) => {
			if (o1[key] === o2[key]) return diff
			return {
				...diff,
				[key]: o2[key],
			}
		}, {})
		console.log(diff)

		if (format.oldUsername(olduser) !== format.oldUsername(newuser)) {
			database.set(`.users.${newuser.id}.usernames.${Date.now()}`, {
				from: olduser.tag,
				to: newuser.tag,
			})
			// user.updateUsername(newuser)
		} else {
			// console.log("not saving usernames cuz theyre the same lol")
		}
	},
})
