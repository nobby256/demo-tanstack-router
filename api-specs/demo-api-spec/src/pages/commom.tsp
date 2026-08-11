import "@typespec/http";

using TypeSpec.Http;

// =========================================
// Response
// =========================================
@mediaTypeHint("application/json")
model LoadResponse<T> {
  @statusCode
  statusCode: 200;

  @body
  body: PageViewModel<T>;
}

@mediaTypeHint("application/json")
model ActionResponse<T> {
  @statusCode
  statusCode: 200;

  @body
  body: ActionResult<T>;
}

model ProblemResponse {
  @statusCode
  statusCode: 422;

  @header
  contentType: "application/problem+json";

  @body
  body: ValidationProblem | BusinessRuleProblem;
}

// =========================================
// Problem
// =========================================

model ValidationProblem {
  type: "/problems/validation-error";
  messages: ProblemMessage[];
}

model BusinessRuleProblem {
  type: "/problems/business-rule-error";
  messages: ProblemMessage[];
}

// =========================================
// ViewModel
// =========================================
/**
 * 画面初期表示専用。
 * 画面描画に必要なフォーム値・通知・選択肢をまとめる。
 */
model PageViewModel<T> {
  data: T;
  selectors: Record<SelectOption[]>;
}

model SelectOption {
  value: string;
  label: string;
}

// =========================================
// Action
// =========================================
/**
 * 更新・登録・削除などの操作結果。
 * data が不要な操作では ActionResult<never> を使う。
 */
model ActionResult<T> {
  data?: T;
  messages: ActionMessage[];
}

// =========================================
// Message
// =========================================

model Message {
  level: "info" | "warn" | "error";
  code?: string;
  message: string;
  fields?: string[];
}

model ActionMessage extends Message {
  level: "info" | "warn";
  fields?: never;
}

model ProblemMessage extends Message {
  level: "error";
}
