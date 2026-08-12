import { http, HttpResponse } from 'msw'

import {
  type ErrorHandlingPageDoneBody,
  type ErrorHandlingPageLoadInput,
} from '../../.generated/orval/model/error-handling-page'
import { getErrorHandlingPageLoadResponseMock } from '../../.generated/orval/msw/error-handling-page/error-handling-page.msw'
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
              messages: [
                {
                  level: 'ERROR',
                  fields: ['status'],
                  message: '相関チェックエラー',
                },
                {
                  level: 'ERROR',
                  message: '業務エラーが起きました',
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
      return HttpResponse.json(getErrorHandlingPageLoadResponseMock(), {
        status: 200,
      })
    }),
    http.post(getErrorHandlingPageDoneUrl(), async ({ request }) => {
      const body = (await request.json()) as ErrorHandlingPageDoneBody
      // statusがエラーステータスコードと想定
      const status = Number(body.data.status)
      if (!Number.isNaN(status) && status >= 400) {
        if (status === 422) {
          return HttpResponse.json(
            {
              messages: [
                {
                  level: 'ERROR',
                  fields: ['status'],
                  message: '相関チェックエラー',
                },
                {
                  level: 'ERROR',
                  message: '業務エラーが起きました',
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
      return HttpResponse.json(getErrorHandlingPageLoadResponseMock(), {
        status: 200,
      })
    }),
  ],
}
