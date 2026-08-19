import {
  createTypeSpecLibrary,
  type Model,
  paramMessage,
  type Program,
} from '@typespec/compiler'

export const $lib = createTypeSpecLibrary({
  name: 'rhf-contract',
  diagnostics: {
    'optional-leaf': {
      severity: 'error',
      messages: {
        default: paramMessage`Property '${'propertyName'}' in @rhfContract model '${'modelName'}' must not be optional. Optional scalar and array properties are not allowed.`,
      },
    },
  },
})

/**
 * $lib の method を直接 destructuring すると
 * @typescript-eslint/unbound-method が警告する。
 *
 * wrapper 経由で常に $lib.reportDiagnostic(...) として呼び出し、
 * this binding を保持する。
 */
export const reportDiagnostic = (
  ...args: Parameters<typeof $lib.reportDiagnostic>
): ReturnType<typeof $lib.reportDiagnostic> => {
  return $lib.reportDiagnostic(...args)
}

/**
 * decorator 処理済みの anonymous model を管理する state key。
 *
 * 同じ anonymous model を複数経路から辿った場合や、
 * 再帰的な構造が存在する場合に、同一 property を重複処理しないために使う。
 *
 * default 値自体は stateMap には保存しない。
 * OpenAPI emitter に default を出力させるため、decorators.ts から
 * ModelProperty.defaultValue に直接設定する。
 */
const processedRhfAnonymousModelKey = $lib.createStateSymbol(
  'processed-rhf-anonymous-model',
)

/**
 * parent @rhfContract から再帰走査した anonymous model が、
 * すでに処理済みかを返す。
 */
export function hasProcessedAnonymousModel(
  program: Program,
  model: Model,
): boolean {
  return program.stateSet(processedRhfAnonymousModelKey).has(model)
}

/**
 * parent @rhfContract から再帰走査した anonymous model を、
 * 処理済みとして記録する。
 */
export function markAnonymousModelProcessed(
  program: Program,
  model: Model,
): void {
  program.stateSet(processedRhfAnonymousModelKey).add(model)
}
