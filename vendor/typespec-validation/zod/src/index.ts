import * as z from 'zod'

import {
  isDecimalOption,
  validateDecimal,
  validateDecimalMeta,
} from './decimal'
import { throwSchemaError } from './schema-error'

export const validate = (type: string, option: unknown) => {
  if (type !== 'string') {
    throwSchemaError('validate', { type, option }, `unsupported type: ${type}`)
  }

  if (isDecimalOption(option)) {
    validateDecimalMeta(option)

    return z.string().superRefine((value, ctx) => {
      validateDecimal(value, ctx, option)
    })
  }

  throwSchemaError('validate', { type, option }, `unsupported option kind`)
}
