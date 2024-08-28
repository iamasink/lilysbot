import {
	ApplicationCommandManager,
	Client,
	Collection,
	FetchApplicationCommandOptions,
	ClientOptions
} from "discord.js"
import { token } from "../config.json"
import { readdirSync } from "fs"
import path from "node:path"
import ApplicationCommand from "../types/ApplicationCommand"
import Event from "../types/Event"
import database from "../utils/database"
import { loadCommands } from "../utils/loader"
import BridgeManager from "./BridgeManager"

// Bot is a class which extends discord.js Client,
// it is called in index.ts
export class Bot extends Client {
	commands: Collection<string, ApplicationCommand> = new Collection()
	// commandManager: ApplicationCommandManager
	// awaw: FetchApplicationCommandOptions
	bridgeManager: BridgeManager
	constructor(options: ClientOptions) {
		super(options)
		this.bridgeManager = new BridgeManager()
	}

	// function to login and start the bot
	start() {
		database.connect()
		this.register()
		this.login(token)
		console.log("starting!")
	}

	// function to register commands and events
	async register() {
		// register commands
		const commandsList = await loadCommands()

		console.log(`Found ${commandsList.length} Commands`)
		commandsList.forEach(async (command) => {
			this.commands.set(command.data.name, command)
			console.log(`Successfully registered /${command.data.name} command`)
		})

		// register events
		const filepath = path.join(__dirname, "..", "events")
		console.log(filepath)
		const eventFiles: string[] = readdirSync(filepath).filter(
			(file) => file.endsWith(".js") || file.endsWith(".ts"),
		)
		console.log(eventFiles)

		eventFiles.forEach(async (file) => {
			const event: Event = (await import(`../events/${file}`))
				.default as Event
			if (event.once) {
				this.once(event.name, (...args) => event.execute(...args, this))
			} else {
				this.on(event.name, (...args) => event.execute(...args, this))
			}
		})
	}
}
