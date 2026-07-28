export interface RouterContext {
  canRollbackNavigationError(error: unknown): boolean
}

/**
 * RouterContextを取得します。
 */
export function requireRouterContext(context: unknown): RouterContext {
  if (!context || typeof context !== 'object') {
    throw new Error(
      [
        'routeBoundary requires RouterContext.',
        '',
        'The router context passed to routeBoundary is missing or invalid.',
        '',
        'Configure the following property in your root router context:',
        '',
        'createRouter({',
        '  context: {',
        '    canRollbackNavigationError: (error) => boolean,',
        '  },',
        '})',
      ].join('\n'),
    )
  }

  return context as RouterContext
}
