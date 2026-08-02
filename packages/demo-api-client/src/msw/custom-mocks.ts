import { http, HttpResponse } from 'msw'

import {
  type ErrorHandlingPageDoneInput,
  type ErrorHandlingPageLoadInput,
} from '../../.generated/orval/model/error-handling-page'
import {
  getErrorHandlingPageDoneUrl,
  getErrorHandlingPageLoadUrl,
} from '../../.generated/orval/op/error-handling-page'

export const customMocks = {
  getErrorHandlingPageMock: () => [
    http.post(getErrorHandlingPageLoadUrl(), async ({ request }) => {
      const body = (await request.json()) as ErrorHandlingPageLoadInput
      // statusがエラーステータスコードと想定
      const status = Number(body.status)
      if (!Number.isNaN(status) && status >= 400) {
        if (status === 422) {
          return HttpResponse.json(
            {
              errors: [
                {
                  field: 'keyword',
                  message: 'Validation error',
                },
              ],
            },
            { status: 422 },
          )
        } else {
          // 422以外
          return HttpResponse.json(
            {
              message: `Mock Error ${status}`,
            },
            { status },
          )
        }
      }
      // 400以上でなければ空のデータを返す
      return HttpResponse.json(
        {},
        {
          status: 200,
        },
      )
    }),
    http.post(getErrorHandlingPageDoneUrl(), async ({ request }) => {
      const body = (await request.json()) as ErrorHandlingPageDoneInput
      // statusがエラーステータスコードと想定
      const status = Number(body.status)
      if (!Number.isNaN(status) && status >= 400) {
        if (status === 422) {
          return HttpResponse.json(
            {
              errors: [
                {
                  field: 'keyword',
                  message: 'Validation error',
                },
              ],
            },
            { status: 422 },
          )
        } else {
          // 422以外
          return HttpResponse.json(
            {
              message: `Mock Error ${status}`,
            },
            { status },
          )
        }
      }
      // 400以上でなければExampleのデータを返す
      return HttpResponse.json(
        {},
        {
          status: 200,
        },
      )
    }),
  ],
}
