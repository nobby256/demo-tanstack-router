import type { AppError } from '../adapter/AppError'
import type { DomainError } from './DomainError'
import type {
  ErrorTransformer,
  FieldMessageItem,
  MessageItem,
  Notification,
} from './ErrorTransformer'

export const defaultErrorTransformer: ErrorTransformer = {
  transform(error: AppError): Notification[] {
    //
    // timeout
    //
    if (error.timeout) {
      return [
        {
          type: 'alert',
          code: 'timeout',
        },
      ]
    }

    //
    // JavaScript Runtime Error
    //
    if (!error.httpError) {
      return [
        {
          type: 'alert',
          code: 'unexpected',
        },
      ]
    }

    //
    // 401
    //
    if (error.statusCode === 401) {
      return [
        {
          type: 'alert',
          code: 'unauthorized',
        },
      ]
    }

    //
    // 403
    //
    if (error.statusCode === 403) {
      return [
        {
          type: 'alert',
          code: 'forbidden',
        },
      ]
    }

    //
    // 410
    //
    if (error.statusCode === 410) {
      return [
        {
          type: 'alert',
          code: 'expired',
        },
      ]
    }

    //
    // 422
    //
    if (error.statusCode === 422) {
      return transformDomainError(error)
    }

    //
    // その他HTTPエラー
    //
    return [
      {
        type: 'alert',
        code: 'unexpected',
      },
    ]
  },
}

function transformDomainError(error: AppError): Notification[] {
  const data = error.data as DomainError | undefined

  if (!data) {
    return [
      {
        type: 'alert',
        code: 'unexpected',
      },
    ]
  }

  const fieldItems: FieldMessageItem[] = []
  const notificationItems: MessageItem[] = []

  for (const message of data.messages) {
    if (message.fields?.length) {
      for (const field of message.fields) {
        fieldItems.push({
          field,
          message: message.message,
        })
      }
    } else {
      notificationItems.push({
        level: message.level ?? 'ERROR',
        message: message.message,
      })
    }
  }

  const notifications: Notification[] = []

  if (fieldItems.length > 0) {
    notifications.push({
      type: 'field',
      items: fieldItems,
    })
  }

  if (notificationItems.length > 0) {
    notifications.push({
      type: 'notification',
      items: notificationItems,
    })
  }

  return notifications
}
