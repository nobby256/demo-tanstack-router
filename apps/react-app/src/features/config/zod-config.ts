import { isRequiredIssue } from '@vendor/form'
import { z } from 'zod'

export const zodConfig: Partial<z.core.$ZodConfig> = {
  customError: (issue) => {
    if (isRequiredIssue(issue)) {
      return '必須です'
    }

    return undefined
  },
}
