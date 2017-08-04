import { Channel } from './Channel'
import { IMeta } from './typings/Protobuf'

/**
 * Check execution environment.
 */
export function isBrowser (): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return true
}

/**
 * Check whether the channel is a socket.
 */
export function isSocket (channel: WebSocket | RTCDataChannel): boolean {
  return channel.constructor.name === 'WebSocket'
}

/**
 * Check whether the string is a valid URL.
 */
export function isURL (str: string): boolean {
  const regex =
    '^' +
      // protocol identifier
      '(?:wss|ws)://' +
      // Host name/IP
      '[^\\s]+' +
      // port number
      '(?::\\d{2,5})?' +
    '$'

  return (new RegExp(regex, 'i')).test(str)
}

export interface MessageI {
  senderId: number,
  recipientId: number,
  isService: boolean,
  content: Uint8Array,
  meta: IMeta
}

export interface ServiceMessageEncoded {
  channel: Channel,
  senderId: number,
  recipientId: number,
  id: number,
  timestamp: number,
  content: Uint8Array
}

export interface ServiceMessageDecoded {
  channel: Channel,
  senderId: number,
  recipientId: number,
  timestamp: number,
  msg: any
}