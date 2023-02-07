/**
 * Represents an Application Command
 */
export default class ApplicationCommand {
    data;
    hasSubCommands;
    execute;
    /**
     * @param {{
     *      data: SlashCommandBuilder | ContextMenuCommandBuilder | SlashCommandSubcommandsOnlyBuilder
     *      hasSubCommands?: boolean
     *      execute?: (interaction: ChatInputCommandInteraction) => Promise<void> | void
     *  }} options - The options for the slash command
     */
    constructor(options) {
        if (options.hasSubCommands) {
            this.execute = async (interaction) => {
                const subCommandGroup = interaction.options.getSubcommandGroup();
                const commandName = interaction.options.getSubcommand();
                if (!commandName) {
                    await interaction.reply({
                        content: "I couldn't understand that command!",
                        ephemeral: true,
                    });
                }
                else {
                    try {
                        const command = (await import(`../subCommands/${this.data.name}/${subCommandGroup ? `${subCommandGroup}/` : ''}${commandName}.js`)).default;
                        await command.execute(interaction);
                    }
                    catch (error) {
                        console.error(error);
                        await interaction.reply({
                            content: 'An error occured when attempting to execute that command!',
                            ephemeral: true,
                        });
                    }
                }
            };
        }
        else if (options.execute) {
            this.execute = options.execute;
        }
        else {
            throw new Error('No execute function provided');
        }
        this.data = options.data;
        this.hasSubCommands = options.hasSubCommands ?? false;
    }
}
