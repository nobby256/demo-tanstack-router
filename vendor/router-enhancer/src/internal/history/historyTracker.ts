import { type AnyRouter } from '@tanstack/react-router'

const STORAGE_KEY = 'router-enhancer.histories'

export type HistoryEntry = {
  href: string
  pathname: string
  index: number
}

/**
 * アプリ内で観測したナビゲーション履歴。
 *
 * ブラウザの History API は現在の履歴エントリーしか参照できず、
 * 過去の履歴一覧やその URL を取得することはできない。
 *
 * そのため、TanStack Router の onBeforeLoad を購読し、
 * 遷移時の Location 情報を独自に保持する。
 *
 * 添字には history.state.__TSR_index を使用し、
 * ブラウザ履歴と同じインデックス体系で管理する。
 *
 * また、F5によるリロードでも履歴を維持できるよう、
 * sessionStorage に永続化する。
 */
export const histories: Array<HistoryEntry | undefined> = []

let initialized = false

function loadHistories(): void {
  const json = sessionStorage.getItem(STORAGE_KEY)

  if (!json) {
    return
  }

  try {
    const restored = JSON.parse(json) as Array<HistoryEntry | undefined>

    histories.length = 0
    histories.push(...restored)
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

function saveHistories(): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(histories))
}

/**
 * ナビゲーション履歴の追跡を開始する。
 *
 * アプリ起動時に一度だけ呼び出すことを想定している。
 */
export function initHistoryTracker(router: AnyRouter): void {
  if (initialized) {
    return
  }

  initialized = true

  loadHistories()

  router.subscribe('onBeforeLoad', (event) => {
    const { toLocation } = event

    /**
     * TanStack Router が管理している履歴インデックス。
     *
     * push:
     *   0 → 1 → 2 → 3 ...
     *
     * back:
     *   3 → 2
     *
     * forward:
     *   2 → 3
     */
    const index = toLocation.state.__TSR_index

    const existing = histories[index]

    /**
     * 同じ index に別の href が入り込む場合は、
     * 「戻る」後に別ルートへ遷移した履歴分岐とみなす。
     *
     * 例:
     *
     *   A -> B -> C -> D
     *             ↑
     *           back
     *             ↓
     *   A -> B -> X
     *
     * この場合、C, D は実際のブラウザ履歴からは到達できなくなるため、
     * index 以降の履歴を破棄して履歴スタックを同期する。
     *
     * なお、単なる back / forward の場合は href が一致するため、
     * 履歴は削除しない。
     */
    if (existing && existing.href !== toLocation.href) {
      histories.length = index
    }

    histories[index] = {
      href: toLocation.href,
      pathname: toLocation.pathname,
      index,
    }

    saveHistories()
  })
}
