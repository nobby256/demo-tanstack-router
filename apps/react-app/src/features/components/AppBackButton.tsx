import { type RegisteredRouter, useRouter } from '@tanstack/react-router'
import { findPreviousLocation } from '@vendor/router-enhancer'

type RouterPath = keyof RegisteredRouter['routesByPath']

type Props = {
  pathName: RouterPath
}

export function AppBackButton({ pathName }: Props) {
  const router = useRouter()
  const location = findPreviousLocation(router, pathName)

  const onClick = async () => {
    if (!location) {
      return
    }

    const currentIndex = router.history.location.state.__TSR_index
    const targetIndex = location.state.__TSR_index
    router.history.go(targetIndex - currentIndex)
  }

  return (
    <button type="button" onClick={onClick} disabled={!location}>
      戻る
    </button>
  )
}
