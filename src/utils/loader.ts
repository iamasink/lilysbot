import fs from "node:fs"
import path from "node:path"
import ApplicationCommand from "../types/ApplicationCommand"

/**
 * Finds command in a given path (where command = `.js` or `.ts` file).
 * This will also find subcommands.
 * @param commandsPath The starting path where to look for the commands
 * @returns {string[]} Returns all the paths of the found commands
 */
export function findCommandsPath(commandsPath: string): string[] {
	let commandPaths: string[] = []

	const commandFileExtension = [".js", ".ts"]
	const isCommandFile = (path: string) =>
		commandFileExtension.some((extension) => path.endsWith(extension))

	fs.readdirSync(commandsPath).forEach((innerPath) => {
		innerPath = path.resolve(commandsPath, innerPath)
		const stat = fs.statSync(innerPath)

		if (stat.isDirectory())
			commandPaths = commandPaths.concat(findCommandsPath(innerPath))
		else if (stat.isFile() && isCommandFile(innerPath))
			commandPaths.push(innerPath)
	})

	return commandPaths
}

export async function loadCommands(): Promise<ApplicationCommand[]> {
	console.log("!!!")
	const commands: ApplicationCommand[] = []

	const commandfilepath = path.join(__dirname, "..", "commands")

	const commandFiles: string[] = findCommandsPath(commandfilepath)

	for (const file of commandFiles) {
		const command = (await import(file)).default as ApplicationCommand

		// Make sure a command have "data" & "execute" in their properties
		// Else it could be a subcommand or invalid structure
		if (command && "data" in command && "execute" in command) {
			commands.push(command)
		} else if (command && "name" in command && "execute" in command) {
			// This is a subcommand
			continue
		} else {
			console.trace(
				`Couldn't determine file if its a command (invalid structure): ${file}`,
			)
		}
	}

	return commands
}
