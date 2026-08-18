import { z } from 'zod'
import { type $ZodConfig } from 'zod/v4/core'

z.config({})
export const zodConfig: Partial<$ZodConfig> = {
  customError: (issue) => {
    if (issue.code === 'invalid_type' && issue.input === undefined) {
      return '必須です'
    }

    return undefined
  },
}
