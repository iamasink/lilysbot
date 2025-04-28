import { openaifeatures, chatallowedguilds } from "../config.json"
import format from "../utils/format"
import { GuildTextBasedChannel, Message, Role, TextBasedChannel, TextChannel } from "discord.js"
import { client } from ".."
import { stripIndents } from "common-tags"
import database from "./database"
import axios from "axios"
import embeds from "./embeds"
import moment from "moment"
import { aiprompt, aifilter, softfilter } from "../config.json"

const MODEL = "llama3.2"

const aiurl = process.env.NODE_ENV === "prod" ? "http://ollama:11434" : "http://localhost:11434"

// const model = "gemma3"
// const model = "gemma3:4b"


function formatMsg(message: Message) {
    const messagename = message.member?.displayName?.substring(0, 60) || message.author.displayName || message.author.username || "user"
    const messageDate = moment(message.createdTimestamp);
    const now = moment();
    let formattedDate: string;


    formattedDate = messageDate.fromNow()


    const formattedMessage = `${messagename} (${formattedDate}) | ${message.cleanContent}`;
    return formattedMessage
}


function softfilterMessage(text: string) {
    // remove words from softfilter in old messages
    softfilter.forEach((filter) => {
        const regex = new RegExp(`\\b${filter}\\b`, "gi")
        text = text.replace(regex, "")
        text = text.replace(/^.+\(.*\)\s/g, " ")
    })
    return text
}


type MemoryObject = {
    time: number;
    memory: string;
}

type Memories = MemoryObject[];

async function getMemories() {
    const memories = await database.get(".aimemories")
    return memories as Memories || []
}

async function addMemory(memory: { memory: string }): Promise<void> {
    const currentMemories = await getMemories()

    // Check for duplicate memory
    if (currentMemories.some((m) => m.memory === memory.memory)) {
        console.log("Duplicate memory detected. Skipping addition.")
        return
    }

    currentMemories.push({
        time: Date.now(),
        memory: memory.memory,
    })

    const maxMemories = 100
    if (currentMemories.length > maxMemories) {
        currentMemories.splice(0, currentMemories.length - maxMemories)
    }

    await database.set(".aimemories", currentMemories)
}

async function collectChatMessages(message: Message): Promise<Array<{ role: string; content: string }>> {
    const systemprompt: { role: string; content: string } = {
        role: "system",
        content: aiprompt + stripIndents`        
        # Some information about the environment:
        Messages will be formatted as follows: (Username) ((Time)) | (Message). Where (Username) is the username of the user who sent the message, and (Message) is the content of the message.
        (Time) is the time of a message (eg. 2 minutes ago)
        Wiwwie herself does not need to follow this format. NEVER include the time or her name.
        Users can either reply to a message, or "ping" Wiwwie to get her to respond. Eg of a message she may receive: "lillie (a few seconds ago) | @Wiwwie hey!"
        There may be multiple users in the chat at once. She doesn't always need to respond, an empty message is fine!

        # Current date and time): 
        ${new Date().toLocaleString("en-GB",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZoneName: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,

            })
            }.
        `,
    }
    //     # There are some commands Wiwwie can use in chat. 
    //     These are similar to HTML tags. Any time she types these, the command will trigger.
    //     Here are her commands:

    //     ## Information can be remembered by Wiwwie with this command:
    //     <mem> (memory text) </mem>
    //     Where (memory text) is whatever she wants to remember. Anything inbetween the tags will be remembered. Other users cannot use this!
    //     ANYTHING that may be deemed important should be written to memory! There is no limit!!

    //     # Here are her current memories:
    // ${(
    //     await getMemories()
    // )
    //     .map((m) => `- ${m.memory}`)
    //     .join("\n")}


    const replyMessages: Array<{ role: string; content: string }> = []
    let chatMessages: Array<{ role: string; content: string }> = []

    if (message.reference) {
        console.log("Message is a reply, collecting context from the referenced message.")

        // const referenceGuild = await client.guilds.fetch(message.reference.guildId!)
        // const referenceChannel: GuildTextBasedChannel = (await referenceGuild.channels.fetch(message.reference.channelId!) as GuildTextBasedChannel)
        // const referenceMessage = await referenceChannel.messages.fetch(message.reference.messageId!)
        const messagename = message.member?.displayName?.substring(0, 60) || "user"
        const referenceChannel = message.channel as GuildTextBasedChannel

        let replyhistory: Message[] = []
        let currentReference = message.reference

        replyhistory.push(message)

        // Loop through message replies up to 5 levels deep
        // go through from the first reference message, then that's reference, etc. adding each to replyhistory
        for (let i = 0; i < 5; i++) {
            if (!currentReference) break
            try {
                const refMsg = await referenceChannel.messages.fetch(currentReference.messageId)
                replyhistory.push(refMsg)
                currentReference = refMsg.reference
            } catch (error) {
                console.error(`Failed to fetch referenced message: ${error}`)
                break
            }
        }



        // Use replyhistory for context
        replyhistory.reverse().forEach((refMsg: Message) => {
            if (refMsg.author.id === client.user.id) {
                if (refMsg.embeds.length > 0) {
                    console.log("Ignoring because it has an embed.")
                    return
                }

                replyMessages.push({
                    role: "assistant",
                    content: softfilterMessage(refMsg.cleanContent),
                })
            } else {
                const refMessagename = refMsg.member?.displayName?.substring(0, 60) || refMsg.author.username || "user"

                replyMessages.push({
                    role: "user",
                    content: formatMsg(refMsg),
                })
            }
        })

        // console.log("Reply history:", replyhistory)

        // add recent messages, de-duping with already collected messages
        const recentMessages = await referenceChannel.messages.fetch({ limit: 10 })
        const extracontext: Array<{ role: string; content: string }> = []
        recentMessages.reverse().forEach((m: Message) => {
            if (replyhistory.some((msg) => msg.id === m.id)) {
                console.log("Ignoring because it is already in the reply history.")
                return
            }

            if (m.author.id === client.user.id) {
                // if (m.embeds.length > 0) {
                //     console.log("Ignoring because it has an embed.")
                //     return
                // }
                if (m.content.length < 3) {
                    console.log("Ignoring because it is too short.")
                    return
                }


                extracontext.push({
                    role: "assistant",
                    content: softfilterMessage(m.cleanContent),
                })
            } else if (!replyhistory.some((msg) => msg.id === m.id)) {

                extracontext.push({
                    role: "user",
                    content: formatMsg(m),
                })
            }

        })

        // console.log("Extracontext:", extracontext)

        // add extracontext to beginning of chat messages
        chatMessages = [...extracontext, ...replyMessages,]

        // console.log("Chat messages after adding extracontext:", chatMessages)


    } else {
        console.log("Message is not a reply, collecting context from the last few messages.")

        const messages = await message.channel.messages.fetch({ limit: 50 })
        messages.reverse().forEach((m: Message) => {
            if (m.author.id === client.user.id) {
                let messagecontent = softfilterMessage(m.cleanContent)
                let role = "assistant"

                if (m.embeds.length > 0) {
                    console.log("embeds..")
                    for (let i = 0, len = m.embeds.length; i < len; i++) {
                        const embed = m.embeds[i]
                        messagecontent += stripIndents`\n(embedded content:)
                        ${embed.title}
                        ${embed.description ? embed.description : ""}
                        ${embed.fields.map((f) => `${f.name}: ${f.value}`).join("\n")}`
                    }

                    // dont confuse the AI with a weird assistant message
                    role = "tool"
                    // else because messages w/ embeds might have empty message content
                } else if (m.content.length < 2) {
                    console.log("Ignoring because it is too short.")
                    return
                }

                chatMessages.push({
                    role: role,
                    content: messagecontent,
                })
            } else {
                const messagename = m.member?.displayName?.substring(0, 60) || m.author.username || "user"

                chatMessages.push({
                    role: "user",
                    content: formatMsg(m),
                })
            }
        })
    }

    if (chatMessages.some((m) => m.content.includes("[newcontext]"))) {
        console.log("New context detected, clearing chat messages.")
        const newContextIndex = chatMessages
            .map((m, index) => (m.content.includes("[newcontext]") ? index : -1))
            .filter((index) => index !== -1)
            .pop(); // Get the last occurrence of [newcontext]

        if (newContextIndex !== undefined) {
            chatMessages.splice(0, newContextIndex); // Remove all messages before the new context
            console.log("Chat messages after clearing:", chatMessages)
        } else {
            console.warn("No valid [newcontext] index found, skipping clearing.")
        }
    } else {
        console.log("No new context detected, keeping chat messages.")
    }

    return [systemprompt, ...chatMessages]
}

export default {
    async aiMessage(message: Message, random: boolean = false, reply: boolean = true, model: string = MODEL) {
        if (!openaifeatures) return new Error("Local AI is disabled")

        if (message.author.id === "454357482102587393") {
            return
        }

        if (!message.inGuild() && message.author.id !== "303267459824353280") {
            console.log("Ignoring DM message.")
            return
        }
        if (message.inGuild() && !chatallowedguilds.includes(message.guild.id)) return

        const channel = message.channel as TextChannel

        channel.sendTyping()

        const chatMessages = await collectChatMessages(message)


        console.log("Collected chat messages for AI processing:")
        console.log(JSON.stringify(chatMessages, null, 2))

        try {

            // // first ensure the model is loaded
            // const modelCheck = await axios.get("http://localhost:11434/api/ps")
            // console.log("Model check response:", modelCheck.data)
            // if (JSON.stringify(modelCheck.data).includes(model)) {
            //     console.log("Model is loaded.")
            // } else {
            //     console.log("Model is not loaded, loading...")
            //     responsemsg.edit("<a:dcr_cyclone:1070109871090962503> Loading AI model, this make take a moment...")
            // }

            const controller = new AbortController()
            const response = await axios.post(
                aiurl + "/api/chat",
                {
                    model: model,
                    messages: chatMessages,
                    stream: true,
                    keep_alive: "15m",
                },
                {
                    responseType: "stream",
                    signal: controller.signal,
                }
            )
            let responsemsg = null
            if (reply) {
                responsemsg = await message.reply("<a:dcr_cyclone:1070109871090962503> ...")
            } else {
                responsemsg = await channel.send("<a:dcr_cyclone:1070109871090962503> ...")
            }

            let generatedText = ""
            let lastEditTime = Date.now() - 900
            const editInterval = 1050 // Minimum time interval between edits in milliseconds
            const replaceregex = /^wiwwie\s |/gim
            const memoryRegex = /<mem>(.*?)<\/mem>/i

            // format filter array
            const formattedFilter = aifilter.map((filter) => filter.toLowerCase().trim().replace(/\s|\W|\d/g, ""))

            // console.log("filter info: ")
            // formattedFilter.forEach((filter) => {
            //     console.log("Filter:", filter)
            // })

            // console.log("Received chunk:", chunk.toString())
            response.data.on("data", (chunk: Buffer) => {
                try {
                    // console.log("Parsed chunk:", parsedChunk.message.content)
                    const parsedChunk = JSON.parse(chunk.toString())
                    if (parsedChunk.message && parsedChunk.message.content) {
                        // console.log("Parsed chunk:", parsedChunk.message.content)
                        generatedText = generatedText.substring(0, 1950)


                        // check filter array
                        const checkInFilterText = (generatedText + parsedChunk.message.content).toLowerCase().trim().replace(/\s|\W|\d/g, "")
                        // console.log("checkInFilterText:", checkInFilterText)
                        if (formattedFilter.some((filter) => checkInFilterText.includes(filter))) {
                            console.log("Filtered message:", generatedText + parsedChunk.message.content)

                            generatedText.replace(replaceregex, "")
                            generatedText += " (Filtered.)"
                            console.log("filtered by filter:", formattedFilter.find((f) => checkInFilterText.includes(f)))
                            controller.abort()
                        } else {
                            generatedText += parsedChunk.message.content
                            // if filter passes, continue
                            // Check if enough time has passed since the last edit
                            if (Date.now() - lastEditTime >= editInterval) {
                                // console.log("Editing response message with generated text:", generatedText)
                                responsemsg.edit(generatedText.replace(replaceregex, "") + "<a:dcr_cyclone:1070109871090962503>")
                                lastEditTime = Date.now() // Update the last edit time
                            } else {
                                // console.log(`Not enough time has passed since the last edit. Skipping edit. Time since last edit: ${Date.now() - lastEditTime}ms, Edit interval: ${editInterval}ms`);
                            }
                        }
                    }
                } catch (error) {
                    // console.error("Error parsing chunk:", error)
                }
            })

            response.data.on("end", async () => {
                // console.log(generatedText)

                // Process the full message for memory-writing commands
                const memoryMatch = generatedText.match(memoryRegex)

                if (memoryMatch) {
                    const memoryContent = memoryMatch[1].trim()

                    // console.log(`Writing to memory: ${memoryContent}`)
                    await addMemory({ memory: memoryContent })

                    // Remove the memory-writing command from the final content
                    generatedText = generatedText.replace(replaceregex, "")
                }

                generatedText = generatedText.replace(replaceregex, "").replace("<a:dcr_cyclone:1070109871090962503>\n", "")
                if (generatedText == "") {
                    responsemsg.delete()
                } else {
                    responsemsg.edit(generatedText)
                }
                console.log("Response stream ended. Final text:", generatedText)
            })




            response.data.on("error", (error: Error) => {
                if (error.name == "CanceledError") {
                    console.log("Request was filtered.")
                    generatedText = generatedText.replace(replaceregex, "").replace("<a:dcr_cyclone:1070109871090962503>\n", "...")
                    if (generatedText == "") {
                        responsemsg.delete()
                    } else {
                        responsemsg.edit(generatedText)
                    }
                    return
                }

                console.error("Error streaming response:", error)
                responsemsg.edit("Error streaming response.")
                return
            })
        } catch (error) {
            console.error("Error sending request:", error)
            message.reply("Failed to send request to the local AI.")
        }
    },
};