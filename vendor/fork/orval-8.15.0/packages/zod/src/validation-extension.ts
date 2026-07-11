import type { OpenApiSchemaObject } from '@orval/core';

// ---------------------------------------------
// ✅ extension key（単一責務）
// ---------------------------------------------

export const TYPE_EXTENSION_KEY = 'x-type';

// ---------------------------------------------
// ✅ schema 呼び出し引数
// ---------------------------------------------

export type ValidationMetaArgs = {
  type: string;
  meta: unknown;
};

type ZodFunctionEntry = [string, unknown];

type ZodValidationSchemaDefinitionLike = {
  functions: ZodFunctionEntry[];
};

// ---------------------------------------------
// ❌ 対象外（構造系）
//
// array は例外的に許可する。
// array 自体を置換するのではなく、要素定義を再帰的にたどり、
// 最終的なスカラー型のベース関数を validator に置換する。
// ---------------------------------------------

const UNSUPPORTED_STRUCTURAL_ZOD_BASE_FUNCTIONS = new Set([
  'object',
  'strictObject',
  'looseObject',
  'tuple',
  'allOf',
  'oneOf',
  'anyOf',
  'additionalProperties',
]);

// ---------------------------------------------
// ✅ 内部型判定
// ---------------------------------------------

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isZodValidationSchemaDefinition = (
  value: unknown,
): value is ZodValidationSchemaDefinitionLike => {
  if (!isRecord(value)) {
    return false;
  }

  return Array.isArray(value.functions);
};

// ---------------------------------------------
// ✅ extension取得（完全透過）
// ---------------------------------------------

export const getValidationMeta = (
  schema: OpenApiSchemaObject,
): unknown => {
  const record = schema as Record<string, unknown>;

  return record[TYPE_EXTENSION_KEY];
};

// ---------------------------------------------
// ✅ 適用対象チェック（最小）
// ---------------------------------------------

export const assertExtensionCanBeApplied = (
  schema: OpenApiSchemaObject,
): void => {
  if (schema.enum) {
    throw new Error(
      `[orval/zod] ${TYPE_EXTENSION_KEY} は enum と併用できません。`,
    );
  }
};

// ---------------------------------------------
// ✅ base置換（内部再帰処理）
// ---------------------------------------------

const applyValidationMetaBaseRecursively = (
  functions: ZodFunctionEntry[],
  meta: unknown,
  arrayDepth: number,
): void => {
  if (functions.length === 0) {
    throw new Error(
      `[orval/zod] ${TYPE_EXTENSION_KEY} が指定されていますが、ベースとなるZod関数が存在しません。`,
    );
  }

  const [baseFunctionName, baseFunctionArgs] = functions[0];

  // array は構造を維持し、items側のベース関数を再帰的に置換する。
  if (baseFunctionName === 'array') {
    if (!isZodValidationSchemaDefinition(baseFunctionArgs)) {
      throw new Error(
        `[orval/zod] ${TYPE_EXTENSION_KEY} が指定された配列の要素スキーマを取得できません。`,
      );
    }

    applyValidationMetaBaseRecursively(
      baseFunctionArgs.functions,
      meta,
      arrayDepth + 1,
    );

    return;
  }

  // 配列階層の内側ですでに x-type が適用されている場合、
  // 外側と内側のどちらの meta を使用するかが曖昧になるためエラーにする。
  if (baseFunctionName === 'validator') {
    throw new Error(
      `[orval/zod] ${TYPE_EXTENSION_KEY} が配列階層の複数箇所に指定されています。` +
        '配列または配列要素のいずれか一方にだけ指定してください。',
    );
  }

  // 文字列enumの場合、生成される先頭関数は enum になる。
  // 配列の外側に x-type がある場合は schema.enum を直接確認できないため、
  // 生成済みのZod関数名でも検出する。
  if (baseFunctionName === 'enum') {
    throw new Error(
      `[orval/zod] ${TYPE_EXTENSION_KEY} は enum と併用できません。`,
    );
  }

  if (UNSUPPORTED_STRUCTURAL_ZOD_BASE_FUNCTIONS.has(baseFunctionName)) {
    const arrayContext =
      arrayDepth > 0
        ? `配列要素の構造系スキーマ "${baseFunctionName}"`
        : `構造系スキーマ "${baseFunctionName}"`;

    throw new Error(
      `[orval/zod] ${TYPE_EXTENSION_KEY} は${arrayContext}には適用できません。`,
    );
  }

  // ✅ 完全透過
  //
  // array の場合もここへ到達する時点では最終的な要素型になっている。
  // 例:
  //
  // array(string)
  //   -> array(validator({ type: "string", meta }))
  //
  // array(array(string))
  //   -> array(array(validator({ type: "string", meta })))
  functions[0] = [
    'validator',
    {
      type: baseFunctionName,
      meta,
    },
  ];
};

// ---------------------------------------------
// ✅ base置換（コア）
// ---------------------------------------------

export const applyValidationMetaBase = (
  functions: ZodFunctionEntry[],
  meta: unknown,
): boolean => {
  applyValidationMetaBaseRecursively(functions, meta, 0);

  return true;
};

// ---------------------------------------------
// ✅ schema 呼び出し生成
// ---------------------------------------------

export const renderSchemaInvocation = (
  args: ValidationMetaArgs,
  fnName: string,
): string => {
  return `${fnName}(${JSON.stringify(args.type)}, ${JSON.stringify(args.meta)})`;
};
