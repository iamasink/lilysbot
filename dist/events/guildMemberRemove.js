"use strict"
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value) }) }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)) } catch (e) { reject(e) } }
        function rejected(value) { try { step(generator["throw"](value)) } catch (e) { reject(e) } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected) }
        step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
}
//const database = require('../structure/database') idk why it complains about this /shrug
//const commands = require('../structure/commands')
const embeds = require('../structure/embeds')
const format = require('../structure/format')
const { EmbedBuilder } = require('discord.js')
const log = require('../structure/log')
// Emitted whenever a user joins a guild.
export default {
    name: "guildMemberRemove",
    execute(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (member.pending) {
                log.log(member.guild, `${member.id} has left guild ${member.guild}, but never passed rules screening`)
                return
            }
            log.log(member.guild, `${member.id} has left guild ${member.guild}`)
            console.log(member)
            console.log(`${member.id} has left guild ${member.guild}`)
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(`${member.user.tag} Left.`)
                .setDescription(`They were a member for ${format.time(Date.now() - member.joinedTimestamp)}.\nJoined on <t:${member.joinedTimestamp.toString().slice(0, -3)}:f>`)
                .setThumbnail(member.user.avatarURL(true))
            member.guild.systemChannel.send({ embeds: [embed] })
        })
    },
}
