// declareの読み込み
import './tanstack-history'

// init
export {
  createEnhancedRouter,
  type RecoverableErrorStrategy,
  type RouterEnhancerOptions,
} from './internal/createEnhancedRouter'

// action
export { useActionBoundary } from './internal/action'

// navigation
export { useQueryState } from './internal/navigation'

// router
export {
  routeBoundary,
  omitQueryState,
  formPageReloadPolicy,
} from './internal/router'

// history
export { useBackTo } from './internal/history'

// context
export {
  type AppError,
  type ErrorAdapter,
  type RouterContext,
  ofetchErrorAdapter,
  type ErrorTransformer,
  type Notification,
  defaultErrorTransformer,
  type AlertMessageResolver,
  defaultAlertMessageResolver,
} from './internal/context'

// error-notification
export { useNotifications } from './internal/error-notification'
