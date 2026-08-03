export interface DomainError {
  messages: DomainMessage[]
}

export interface DomainMessage {
  level?: string
  message: string
  fields?: string[]
}
