import { Events, Interaction, Message, User } from "discord.js"
import Event from "../types/Event"
import { client } from "../index"
import database from "../utils/database"

// Emitted whenever ?
export default new Event({
	name: Events.UserUpdate,
	async execute(olduser: User, newuser: User) {
		console.log("a user was updated!")
		console.log(olduser.tag)
		console.log(newuser.tag)
		database.set(`.users.${newuser.id}.usernames.${Date.now()}`, { from: olduser.tag, to: newuser.tag })
	},
}
)