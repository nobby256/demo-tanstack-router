import { type ErrorAdapter } from './adapter/ErrorAdapter'
import { type AlertMessageResolver } from './resolver/AlertMessageResolver'
import { type ErrorTransformer } from './transformer/ErrorTransformer'

export interface RouterContext {
  errorAdapter: ErrorAdapter
  errorTransformer: ErrorTransformer
  alertMessageResolver: AlertMessageResolver
}
