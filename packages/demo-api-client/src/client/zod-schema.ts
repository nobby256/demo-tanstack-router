import { validate } from '@vendor/typespec-validation/zod'

export const schema = (type: string, meta: unknown) => {
  return validate(type, meta)
}
