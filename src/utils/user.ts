import { User } from 'discord.js'
import { levels } from '../config.json'
import database from './database'

export default {
    async updateUsername(user: User) {
        // let oldUsername: string = await database.get(`.users.${user.id}.usernames.recent.name`) || ""
        // if (oldUsername.endsWith("#0")) oldUsername = oldUsername.slice(0, -2)

        // console.log(oldUsername)
        // if (oldUsername === user.username) return


        // database.set(`.users.${newuser.id}.usernames.${Date.now()}`, { from: olduser.tag, to: newuser.tag })
    }
}