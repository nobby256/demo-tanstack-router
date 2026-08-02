import { type RegisteredRouter } from '@tanstack/react-router'
import { useBackTo } from '@vendor/router-enhancer'

type RouterPath = keyof RegisteredRouter['routesByPath']

type Props = {
  pathName: RouterPath
}

export function AppBackButton({ pathName }: Props) {
  const back = useBackTo(pathName)
  return (
    <button type="button" onClick={back} disabled={!back}>
      戻る
    </button>
  )
}
