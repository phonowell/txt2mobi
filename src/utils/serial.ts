export const SERIAL_SUFFIX = /-\d+$/

export const normalizeSerial = (name: string) => name.replace(SERIAL_SUFFIX, '')
