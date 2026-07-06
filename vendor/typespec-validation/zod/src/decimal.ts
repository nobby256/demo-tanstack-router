import * as z from 'zod'

import { throwSchemaError } from './schema-error'

export interface DecimalOption {
  kind: 'decimal'

  // DECIMAL(p,s)
  precision: number
  scale?: number

  // 値範囲
  min?: number
  max?: number
  minExclusive?: number
  maxExclusive?: number

  // 区切り
  multipleOf?: number
}

export function isDecimalOption(value: unknown): value is DecimalOption {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    value.kind === 'decimal'
  )
}

export function validateDecimalMeta(option: DecimalOption) {
  const scale = option.scale ?? 0
  const precision = option.precision

  if (precision <= 0) {
    throwSchemaError(
      'decimal',
      option,
      'precisionには 1以上を指定してください。',
    )
  }

  if (scale < 0) {
    throwSchemaError('decimal', option, 'scaleには 0以上を指定してください。')
  }

  if (precision < scale) {
    throwSchemaError(
      'decimal',
      option,
      'precision は scale 以上である必要があります。',
    )
  }

  if (option.min !== undefined && option.minExclusive !== undefined) {
    throwSchemaError(
      'decimal',
      option,
      'min と minExclusive は同時に指定できません。',
    )
  }

  if (option.max !== undefined && option.maxExclusive !== undefined) {
    throwSchemaError(
      'decimal',
      option,
      'max と maxExclusive は同時に指定できません。',
    )
  }

  if (option.multipleOf !== undefined && option.multipleOf <= 0) {
    throwSchemaError(
      'decimal',
      option,
      'multipleOf は 0より大きい値を指定してください。',
    )
  }
}

export function validateDecimal(
  value: string,
  ctx: z.RefinementCtx,
  option: DecimalOption,
) {
  const scale = option.scale ?? 0
  const precision = option.precision

  // 数値形式
  const decimalRegex = /^-?\d+(\.\d+)?$/

  if (!decimalRegex.test(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '数値形式で入力してください。',
    })
    return
  }

  const [integerPart, decimalPart = ''] = value.replace('-', '').split('.')

  // scale
  if (decimalPart.length > scale) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `小数部は${scale}桁以内で入力してください。`,
    })
    return
  }

  // precision
  const maxIntegerDigits = precision - scale

  if (integerPart.length > maxIntegerDigits) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `整数部は${maxIntegerDigits}桁以内で入力してください。`,
    })
    return
  }

  const numericValue = Number(value)

  // min
  if (option.min !== undefined && numericValue < option.min) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${option.min}以上を入力してください。`,
    })
    return
  }

  // max
  if (option.max !== undefined && numericValue > option.max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${option.max}以下を入力してください。`,
    })
    return
  }

  // minExclusive
  if (
    option.minExclusive !== undefined &&
    numericValue <= option.minExclusive
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${option.minExclusive}より大きい値を入力してください。`,
    })
    return
  }

  // maxExclusive
  if (
    option.maxExclusive !== undefined &&
    numericValue >= option.maxExclusive
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${option.maxExclusive}より小さい値を入力してください。`,
    })
    return
  }

  // multipleOf
  if (option.multipleOf !== undefined) {
    const quotient = numericValue / option.multipleOf

    if (Math.abs(quotient - Math.round(quotient)) > Number.EPSILON) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${option.multipleOf}単位で入力してください。`,
      })
      return
    }
  }
}
