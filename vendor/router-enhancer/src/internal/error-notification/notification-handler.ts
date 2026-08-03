import type { Notification, RouterContext } from '../context'

import { addNotifications } from './notifications'

export type NotificationContext = {
  form?: {
    setError(
      name: string,
      error: {
        type?: string
        message?: string
      },
      options?: {
        shouldFocus: boolean
      },
    ): void
  }
}

export function applyNotifications(
  notifications: Notification[],
  routerContext: RouterContext,
  context?: NotificationContext,
): void {
  for (const notification of notifications) {
    applyNotification(notification, routerContext, context)
  }
}

function applyNotification(
  notification: Notification,
  routerContext: RouterContext,
  context?: NotificationContext,
): void {
  switch (notification.type) {
    case 'field':
      if (context) {
        applyFieldNotification(context, notification)
      }
      return

    case 'alert':
      applyAlertNotification(routerContext, notification)
      return

    case 'notification':
      applyMessageNotification(notification)
      return
  }
}

function applyFieldNotification(
  context: NotificationContext,
  notification: Extract<
    Notification,
    {
      type: 'field'
    }
  >,
): void {
  const form = context.form

  if (!form) {
    return
  }

  for (const item of notification.items) {
    form.setError(item.field, {
      type: 'manual',
      message: item.message,
    })
  }
}

function applyAlertNotification(
  routerContext: RouterContext,
  notification: Extract<
    Notification,
    {
      type: 'alert'
    }
  >,
): void {
  const message = routerContext.alertMessageResolver.resolve(notification.error)

  alert(message)
}

function applyMessageNotification(
  notification: Extract<
    Notification,
    {
      type: 'notification'
    }
  >,
): void {
  addNotifications(...notification.items)
}
