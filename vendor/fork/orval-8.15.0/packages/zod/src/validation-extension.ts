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

// ---------------------------------------------
// ❌ 対象外（構造系）
// ---------------------------------------------

const STRUCTURAL_ZOD_BASE_FUNCTIONS = new Set([
  'array',
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
// ✅ base置換（コア）
// ---------------------------------------------

export const applyValidationMetaBase = (
  functions: ZodFunctionEntry[],
  meta: unknown,
): boolean => {
  if (functions.length === 0) {
    throw new Error(
      `[orval/zod] ${TYPE_EXTENSION_KEY} が指定されていますが、ベースとなるZod関数が存在しません。`,
    );
  }

  const [baseFunctionName] = functions[0];

  if (STRUCTURAL_ZOD_BASE_FUNCTIONS.has(baseFunctionName)) {
    throw new Error(
      `[orval/zod] ${TYPE_EXTENSION_KEY} は構造系スキーマ "${baseFunctionName}" には適用できません。`,
    );
  }

  // ✅ 完全透過
  functions[0] = [
    'validator',
    {
      type: baseFunctionName,
      meta,
    },
  ];

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