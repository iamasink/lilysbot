import { Events, Interaction, Message } from "discord.js"
import Event from "../types/Event"

// Emitted whenever any event happens
export default new Event({
	name: Events.Raw,
	async execute(data) {
		// console.log("raw event:")
		// console.log(data)
		// switch (data.t) {
		// 	case "MESSAGE_REACTION_REMOVE": {
		// 		break
		// 	}
		// 	default: {
		// 		break
		// 		}
		// }
	},
})
