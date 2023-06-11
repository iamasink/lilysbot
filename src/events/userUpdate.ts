import { Events, Interaction, Message, User } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"
import format from "../utils/format"

// Emitted whenever ?
export default new Event({
	name: Events.UserUpdate,
	async execute(olduser: User, newuser: User) {
		console.log("a user was updated!")
		console.log(olduser.tag)
		console.log(newuser.tag)

		if (format.shittyUsername(olduser) !== format.shittyUsername(newuser)) {
			database.set(`.users.${newuser.id}.usernames.${Date.now()}`, { from: olduser.tag, to: newuser.tag })
		} else {
			console.log("not saving usernames cuz theyre the same lol")
		}

	},
}
)