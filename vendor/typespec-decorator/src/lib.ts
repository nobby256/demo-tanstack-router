import {
  createTypeSpecLibrary,
  type Model,
  type ModelProperty,
  type Program,
  type Type,
} from '@typespec/compiler'

export const $lib = createTypeSpecLibrary({
  name: 'rhf-contract',
  diagnostics: {
    'optional-leaf': {
      severity: 'error',
      messages: {
        default:
          "Property '{propertyName}' in @rhfContract model '{modelName}' must not be optional. Optional scalar and array properties are not allowed.",
      },
    },
  },
})

export const reportDiagnostic = (
  ...args: Parameters<typeof $lib.reportDiagnostic>
): ReturnType<typeof $lib.reportDiagnostic> => {
  return $lib.reportDiagnostic(...args)
}

export const createStateSymbol = (
  ...args: Parameters<typeof $lib.createStateSymbol>
): ReturnType<typeof $lib.createStateSymbol> => {
  return $lib.createStateSymbol(...args)
}

export type RhfImplicitDefault =
  | {
      kind: 'string'
      value: ''
    }
  | {
      kind: 'boolean'
      value: false
    }
  | {
      kind: 'array'
      value: readonly []
    }

/**
 * TypeSpec Program.stateMap() の key は symbol。
 *
 * createStateSymbol() により、このライブラリ固有の symbol を得る。
 */
const rhfImplicitDefaultKey = createStateSymbol('rhf-implicit-default')

/**
 * parent @rhfContract から再帰走査した anonymous model の処理済み状態。
 *
 * 同一 anonymous model を複数経路から辿った場合や、循環的な型参照がある場合に、
 * 同じ property を重複処理しないために使う。
 */
const processedRhfAnonymousModelKey = createStateSymbol(
  'processed-rhf-anonymous-model',
)

/**
 * Program.stateMap() の型定義は Map<Type, any> なので、
 * ライブラリ内部だけで使う型付き accessor をここに閉じ込める。
 */
function getRhfImplicitDefaultState(
  program: Program,
): Map<Type, RhfImplicitDefault> {
  return program.stateMap(rhfImplicitDefaultKey) as Map<
    Type,
    RhfImplicitDefault
  >
}

function getProcessedAnonymousModelState(program: Program): Set<Type> {
  return program.stateSet(processedRhfAnonymousModelKey)
}

/**
 * 後続 emitter 用の内部 API。
 *
 * public entry point（src/index.ts）から export しなければ、
 * package 利用者に公開されない。
 */
export function getRhfImplicitDefault(
  program: Program,
  property: ModelProperty,
): RhfImplicitDefault | undefined {
  return getRhfImplicitDefaultState(program).get(property)
}

export function setRhfImplicitDefault(
  program: Program,
  property: ModelProperty,
  value: RhfImplicitDefault,
): void {
  getRhfImplicitDefaultState(program).set(property, value)
}

export function hasProcessedAnonymousModel(
  program: Program,
  model: Model,
): boolean {
  return getProcessedAnonymousModelState(program).has(model)
}

export function markAnonymousModelProcessed(
  program: Program,
  model: Model,
): void {
  getProcessedAnonymousModelState(program).add(model)
}
