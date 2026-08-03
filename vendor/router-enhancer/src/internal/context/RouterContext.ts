import { type ErrorAdapter } from './adapter/ErrorAdapter'
import { type ErrorTransformer } from './transformer/ErrorTransformer'

export interface RouterContext {
  errorAdapter: ErrorAdapter
  errorTransformer: ErrorTransformer
}
