import type { AlertMessageResolver, Notification } from '../context'

import { type FormHandler } from './error-handler'
import { addNotifications } from './notifications'

export function applyNotifications(
  notifications: Notification[],
  resolver: AlertMessageResolver,
  form?: FormHandler,
): void {
  for (const notification of notifications) {
    applyNotification(notification, resolver, form)
  }
}

function applyNotification(
  notification: Notification,
  resolver: AlertMessageResolver,
  form?: FormHandler,
): void {
  switch (notification.type) {
    case 'field':
      if (form) {
        applyFieldNotification(notification, form)
      }
      return

    case 'alert':
      applyAlertNotification(notification, resolver)
      return

    case 'notification':
      applyMessageNotification(notification)
      return
  }
}

function applyFieldNotification(
  notification: Extract<
    Notification,
    {
      type: 'field'
    }
  >,
  form: FormHandler,
): void {
  for (const item of notification.items) {
    form.setError(item.field, {
      type: 'manual',
      message: item.message,
    })
  }
}

function applyAlertNotification(
  notification: Extract<
    Notification,
    {
      type: 'alert'
    }
  >,
  resolver: AlertMessageResolver,
): void {
  const message = resolver.resolve(notification.error)

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
