import mitt from 'mitt'

export type NotificationEvent =
  | {
      type: 'error'
      error: Error
    }
  | {
      type: 'message'
      message: string[]
    }

export const notificationBus = mitt<{
  notification: NotificationEvent
}>()
