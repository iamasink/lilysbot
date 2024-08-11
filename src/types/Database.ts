import { Role, Snowflake } from "discord.js"

export interface StarboardMessageSchema {
	starMessage: Snowflake // Message ID
	originalMessage: Snowflake // Message ID
}

export interface LastChannelSchema {
	guild: Snowflake // Guild ID
	channel: Snowflake // Channel ID
	message: Snowflake // Message ID
}

export interface InviteSchema {
	inviterId: string
	name: string
	uses: number
	expired: boolean
	code: string
}

export interface UserSchema {
	invitedLink: string
	xp: number
	aitokenusage: number
}

export interface UsernameSchema {
	[date: string]: {
		from: string
		to: string
	}
}

export interface BridgeSchema {
	channel1: Snowflake
	channel2: Snowflake
}

export interface RolesMenuSchema {
	list: string
	name: string
}

export interface RolesListSchema {
	roles: Role[]
}

export interface GuildSettings_Schema {
	log_channel: Snowflake // The channel id where moderation logs should go.
	starboard_channel: Snowflake // The channel id for starred messages.
	welcome_message: boolean // Whether to show the member welcome message.
	leave_message: boolean // Whether to show a message when a member leaves.
	leave_kick_message: boolean //  Whether to show a message when a member leaves, when a member is kicked or banned.
	openai_model: string // Defaults to 'gpt-3.5-turbo'
}
