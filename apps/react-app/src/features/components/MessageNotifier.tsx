import { useNotifications } from '@vendor/router-enhancer'

export function MessageNotifier() {
  const [notifications] = useNotifications()
  return (
    <ul>
      {notifications.map((item, index) => (
        <li key={index}>
          {item.level} {item.message}
        </li>
      ))}
    </ul>
  )
}
