type NoSpaces<T extends string> = T extends `${infer Head} ${infer Tail}`
	? never
	: T

interface BaseSetting {
	name: string
	value: string
	description: string
	default?: any
}

interface SelectorOption {
	value: string
	label?: string
}
interface SelectorOptionLabel extends SelectorOption {
	label: string
}

interface StringSetting extends BaseSetting {
	type: "string"
	options: SelectorOption[]
	default?: string
}

interface OtherSetting extends BaseSetting {
	type: "channel" | "role" | "other"
	options?: never // Ensure `options` is not present
	default?: never
}

interface BooleanSetting extends BaseSetting {
	type: "toggle"
	options?: never
	default: boolean
}

type Setting = StringSetting | OtherSetting | BooleanSetting
