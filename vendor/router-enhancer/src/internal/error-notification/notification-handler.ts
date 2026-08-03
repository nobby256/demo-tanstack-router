import type { Notification, RouterContext } from '../context'

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
  context: NotificationContext,
  routerContext: RouterContext,
  notifications: Notification[],
): void {
  for (const notification of notifications) {
    applyNotification(context, routerContext, notification)
  }
}

function applyNotification(
  context: NotificationContext,
  routerContext: RouterContext,
  notification: Notification,
): void {
  switch (notification.type) {
    case 'field':
      applyFieldNotification(context, notification)
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
  /**
   * TODO:
   *
   * notificationStore.push(
   *   ...notification.items
   * )
   */
}
