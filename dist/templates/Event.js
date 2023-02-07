/**
 * Represents an Event
 */
export default class Event {
    name;
    once;
    execute;
    /**
     * @param {{
     *      name: string,
     *      once: boolean,
     *      execute: (...args: any) => Promise<void> | void
     *  }} object
     */
    constructor(object) {
        this.name = object.name;
        this.once = object.once ?? false;
        this.execute = object.execute;
    }
}
