type type = "channel" | "role" | "toggle"

type setting = {
	name: string,
	value: string,
	description: string,
	type: type,
	default: boolean
}