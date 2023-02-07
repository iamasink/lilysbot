/**
 * Represents a SubCommand
 */
export default class SubCommand {
    execute;
    /**
     *
     * @param {{
     *      execute: Function
     *  }} options - The options for the subcommand
     */
    constructor(options) {
        this.execute = options.execute;
    }
    /**
     * @param {(interaction: ChatInputCommandInteraction) => Promise<void> | void} executeFunction - The function
     */
    setExecute(executeFunction) {
        this.execute = executeFunction;
    }
}
