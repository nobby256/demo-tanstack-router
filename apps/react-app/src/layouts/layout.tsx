import { Outlet } from '@tanstack/react-router'

import { MessageNotifier } from '#/features/components/MessageNotifier'

export function LayoutComponent() {
  return (
    <div>
      <h1>Sample App</h1>
      {/*メッセージ表示コンポーネント*/}
      <MessageNotifier />
      <hr />
      <Outlet />
    </div>
  )
}
