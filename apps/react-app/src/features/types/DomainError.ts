export interface Message {
  level: 'info' | 'warn' | 'error'
  message: string
  fields?: string[]
}
export interface DomainError {
  messages: Message[]
}
