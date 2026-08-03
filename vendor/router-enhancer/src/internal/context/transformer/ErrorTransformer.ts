import type { AppError } from '../adapter/AppError'

export interface MessageItem {
  level: string
  message: string
}

export interface FieldMessageItem {
  field: string
  message: string
}

export type Notification =
  | {
      type: 'alert'
      error: AppError
    }
  | {
      type: 'field'
      items: FieldMessageItem[]
    }
  | {
      type: 'notification'
      items: MessageItem[]
    }

export interface ErrorTransformer {
  transform(error: AppError): Notification[]
}
