/**
 * Base class for all commands
 * @abstract
 */
export default class BaseCommand {
    name;
    description;
    execute;
    /**
     * @param {{
     *      name: string,
     *      description: string,
     *      execute: (...args: any) => Promise<void> | void
     *  }} object
     */
    constructor(object) {
        this.name = object.name;
        this.description = object.description;
        this.execute = object.execute;
    }
    /**
     * @param {string} name - The name
     */
    setName(name) {
        this.name = name;
    }
    /**
     * @param {string} description - The description
     */
    setDescription(description) {
        this.description = description;
    }
    /**
     * @param {(...args: any) => Promise<void> | void} executeFunction - The function
     */
    setExecute(executeFunction) {
        this.execute = executeFunction;
    }
}
