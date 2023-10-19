import { Events, Interaction, Message, AuditLogEvent, Guild, ChannelSelectMenuBuilder } from 'discord.js';
import Event from "../types/Event"
import { client } from "../index"
import database from '../utils/database';
import settings from '../utils/settings';
import { Channel } from 'diagnostics_channel';
import log from '../utils/log';
import { stripIndents } from 'common-tags';

const types = {
	GuildUpdate: 1,
	ChannelCreate: 10,
	ChannelUpdate: 11,
	ChannelDelete: 12,
	ChannelOverwriteCreate: 13,
	ChannelOverwriteUpdate: 14,
	ChannelOverwriteDelete: 15,
	MemberKick: 20,
	MemberPrune: 21,
	MemberBanAdd: 22,
	MemberBanRemove: 23,
	MemberUpdate: 24,
	MemberRoleUpdate: 25,
	MemberMove: 26,
	MemberDisconnect: 27,
	BotAdd: 28,
	RoleCreate: 30,
	RoleUpdate: 31,
	RoleDelete: 32,
	InviteCreate: 40,
	InviteUpdate: 41,
	InviteDelete: 42,
	WebhookCreate: 50,
	WebhookUpdate: 51,
	WebhookDelete: 52,
	EmojiCreate: 60,
	EmojiUpdate: 61,
	EmojiDelete: 62,
	MessageDelete: 72,
	MessageBulkDelete: 73,
	MessagePin: 74,
	MessageUnpin: 75,
	IntegrationCreate: 80,
	IntegrationUpdate: 81,
	IntegrationDelete: 82,
	StageInstanceCreate: 83,
	StageInstanceUpdate: 84,
	StageInstanceDelete: 85,
	StickerCreate: 90,
	StickerUpdate: 91,
	StickerDelete: 92,
	GuildScheduledEventCreate: 100,
	GuildScheduledEventUpdate: 101,
	GuildScheduledEventDelete: 102,
	ThreadCreate: 110,
	ThreadUpdate: 111,
	ThreadDelete: 112,
	ApplicationCommandPermissionUpdate: 121,
	AutoModerationRuleCreate: 140,
	AutoModerationRuleUpdate: 141,
	AutoModerationRuleDelete: 142,
	AutoModerationBlockMessage: 143,
	AutoModerationFlagToChannel: 144,
	AutoModerationUserCommunicationDisabled: 145,
	CreatorMonetizationRequestCreated: 150,
	CreatorMonetizationTermsAccepted: 151
}

// Emitted whenever an audit log entry is created
export default new Event({
	name: Events.GuildAuditLogEntryCreate,
	async execute(auditLogEntry: AuditLogEvent, guild: Guild) {
		// console.log(auditLogEntry.toString())
		// const channel = await log.channel2(guild)
		// if (auditLogEntry) {

		// 	// i am most likely not doing this in any decent manner but
		// 	// if (auditLogEntry['action_type'])

		// 	let targetText = ``
		// 	if (auditLogEntry['targetId']) {
		// 		targetText = `${await client.users.fetch(auditLogEntry['executorId'])} => ${await client.users.fetch(auditLogEntry['targetId'])}`
		// 	} else {
		// 		targetText = `${await client.users.fetch(auditLogEntry['executorId'])}`
		// 	}

		// 	let reasonText = ``
		// 	if (auditLogEntry['reason']) {
		// 		reasonText = `For reason: ${auditLogEntry['reason']}\n`
		// 	}

		// 	let changesText = ``
		// 	const changes = auditLogEntry['changes']
		// 	if (changes) {
		// 		if (changes['$add']) { // if changes has an $add property
		// 			return // dont cuz its annoying <3

		// 		} else {

		// 			for (let i = 0, len = auditLogEntry['changes'].length; i < len; i++) {
		// 				const change = auditLogEntry['changes'][i]
		// 				const old = change["old"] || "(none)"
		// 				const newthing = change["new"] || "(none)"
		// 				changesText += stripIndents`\n${change["key"]}:
		// 													${old} => ${newthing}\n`
		// 			}
		// 			// changes = auditLogEntry['changes']

		// 		}
		// 	}

		// 	channel.send({ content: `${targetText}:\n${reasonText}${changesText}\n\n${JSON.stringify(auditLogEntry)}`, allowedMentions: { repliedUser: false, users: [] } })
		// }


	},
})