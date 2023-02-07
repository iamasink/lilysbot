import BaseCommand from './BaseCommand.js';
/*
 * Represents a Message Command
 */
export default class MessageCommand extends BaseCommand {
    aliases;
    execute;
    /**
     * @param {{
     *      name: string,
     *      description: string,
     *      aliases?: string[],
     *      execute: (message: Message, args: string[]) => Promise<void> | void
     *  }} options - The options for the message command
     */
    constructor(options) {
        super(options);
        this.execute = options.execute;
        this.aliases = options.aliases ?? [];
    }
}
