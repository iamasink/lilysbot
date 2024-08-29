import { ChatInputCommandInteraction } from "discord.js"
import { Subcommand } from "../../../../types/ApplicationCommand"

export default {
	name: "update",
	execute: async (interaction: ChatInputCommandInteraction) => {
		// /roles menu update
		//TODO
		// refresh the message with the updated list
	},
} satisfies Subcommand
