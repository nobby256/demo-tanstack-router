export interface DomainError {
  messages: DomainMessage[]
}

export interface DomainMessage {
  level?: string
  message: string
  fields?: string[]
}

export function isDomainError(
  statusCode?: number,
  value?: unknown,
): value is DomainError {
  if (statusCode !== 422) {
    return false
  }

  if (!value || typeof value !== 'object' || !('messages' in value)) {
    return false
  }

  const messages = value.messages

  if (!Array.isArray(messages)) {
    return false
  }

  return messages.every((message) => {
    if (typeof message !== 'object' || message === null) {
      return false
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!('message' in message) || typeof message.message !== 'string') {
      return false
    }

    if (
      'level' in message &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      message.level !== undefined &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof message.level !== 'string'
    ) {
      return false
    }

    if ('fields' in message) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const fields = message.fields

      if (
        fields !== undefined &&
        (!Array.isArray(fields) ||
          !fields.every((field): field is string => typeof field === 'string'))
      ) {
        return false
      }
    }

    return true
  })
}
