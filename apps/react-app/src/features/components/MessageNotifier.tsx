import { useEffect, useState } from 'react'

import {
  messageEventBus,
  type PageMessageItem,
} from '#/features/providers/message'

export function MessageNotifier() {
  const [items, setItems] = useState<PageMessageItem[]>([])

  useEffect(() => {
    const handler = ({ items }: { items: PageMessageItem[] }) => {
      setItems(items)
    }

    messageEventBus.on('pageMessage', handler)

    return () => {
      messageEventBus.off('pageMessage', handler)
    }
  }, [])

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item.level} {item.message}
        </li>
      ))}
    </ul>
  )
}
