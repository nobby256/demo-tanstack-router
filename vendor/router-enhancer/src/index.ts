// declareの読み込み
import './tanstack-history'

// init
export {
  createEnhancedRouter,
  type RecoverableErrorStrategy,
  type RouterEnhancerOptions,
} from './internal/createEnhancedRouter'

// support
export { useCurrentRoute, useCurrentRouteContext } from './internal/supports'

// action
export { useActionBoundary } from './internal/action'

// navigation
export { useQueryState, routeBoundary } from './internal/navigation'

// router
export { omitQueryState, formPageReloadPolicy } from './internal/router'

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
