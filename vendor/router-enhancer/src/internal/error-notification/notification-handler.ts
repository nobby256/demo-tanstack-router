import type { Notification, RouterContext } from '../context'

import { type FormHandler } from './error-handler'
import { addNotifications } from './notifications'

export function applyNotifications(
  notifications: Notification[],
  routerContext: RouterContext,
  form?: FormHandler,
): void {
  for (const notification of notifications) {
    applyNotification(notification, routerContext, form)
  }
}

function applyNotification(
  notification: Notification,
  routerContext: RouterContext,
  form?: FormHandler,
): void {
  switch (notification.type) {
    case 'field':
      if (form) {
        applyFieldNotification(form, notification)
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
  form: FormHandler,
  notification: Extract<
    Notification,
    {
      type: 'field'
    }
  >,
): void {
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
