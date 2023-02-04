"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const tslib_1 = require("tslib")
const database = require('../structure/database')
const commands = require('../structure/commands')
const log = require('../structure/log')
const index_1 = require("../index")
// Emitted whenever a user joins a guild.
export default {
    name: "guildMemberAdd",
    execute(member) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // To compare, we need to load the current invite list.
            const newInvites = yield member.guild.invites.fetch()
            // This is the *existing* invites for the guild.
            const oldInvites = yield database.get(`.guilds.${member.guild.id}.invites`)
            // Look through the invites, find the one for which the uses went up.
            const invite = newInvites.find((i) => i.uses > oldInvites[i.code].uses)
            // update invite cache
            database.set(`.guilds.${member.guild.id}.invites.${invite.code}.uses`, invite.uses)
            // This is just to simplify the message being sent below (inviter doesn't have a tag property)
            const inviter = yield index_1.client.users.fetch(invite.inviterId)
            // set inviter code for member
            database.set(`.guilds.${member.guild.id}.users.${member.id}.invitedLink`, invite.code)
            const inviterUser = yield index_1.client.users.fetch(inviter.id)
            log.log(member.guild, `${member.id}, \`${yield member.user.tag}\` has joined guild ${member.guild}. They were invited by \`${inviterUser.tag}\` (${inviter.id})`)
                .then((msg) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const interaction = yield commands.run(msg, "info", null, "user", [
                        {
                            name: 'target',
                            type: 6,
                            value: member.id,
                            user: yield index_1.client.users.fetch(member.id),
                            member: yield member.guild.members.fetch(member.id)
                        }
                    ])
                }))
            //await database.check(`guilds`, `.${member.guild.id}.users.${member.id}`)
        })
    },
}
