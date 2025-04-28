import {
    ActionRowBuilder,
    ApplicationCommandManager,
    ChannelSelectMenuBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    TextBasedChannel,
} from "discord.js"
import ApplicationCommand from "../types/ApplicationCommand"
import format from "../utils/format"
import database from "../utils/database"
import moment, { now } from "moment"
const axios = require("axios")

export default new ApplicationCommand({
    settings: {
        ownerOnly: true,
    },
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("description"),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        console.log(interaction)
        await interaction.reply("Generating response...");

        // Send the initial request to the LLM
        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "llama3",
            prompt: "Who are you?",
            stream: true, // Assuming the API supports streaming
        }, { responseType: "stream" });

        // Create a variable to store the generated text
        let generatedText = "";
        let lastEditTime = Date.now();

        // Listen to the stream and process chunks of data
        response.data.on("data", (chunk: Buffer) => {
            try {
                // Parse the chunk as JSON
                const parsedChunk = JSON.parse(chunk.toString());
                if (parsedChunk.response) {
                    // Append the response field to the generated text
                    generatedText += parsedChunk.response;

                    // Throttle updates to once per second
                    if (Date.now() - lastEditTime >= 1000) {
                        interaction.editReply(generatedText);
                        lastEditTime = Date.now();
                    }
                }
            } catch (error) {
                console.error("Error parsing chunk:", error);
            }
        });

        // Handle the end of the stream
        response.data.on("end", () => {
            // Ensure the final message is updated
            interaction.editReply(generatedText);
        });

        // Handle errors in the stream
        response.data.on("error", (error: Error) => {
            console.error("Error streaming response:", error);
            interaction.editReply("An error occurred while generating the response.");
        });
    },
});
