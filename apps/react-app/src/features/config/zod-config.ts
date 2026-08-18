import { z } from 'zod'

import { isRequiredIssue } from '#/features/validation'

export const zodConfig: Partial<z.core.$ZodConfig> = {
  customError: (issue) => {
    if (isRequiredIssue(issue)) {
      return '必須です'
    }

    return undefined
  },
}
