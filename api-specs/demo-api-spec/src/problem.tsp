import "@typespec/http";

using TypeSpec.Http;

/**
 * API が返す Problem Details の共通 namespace。
 *
 * HTTP 422 と application/problem+json を使用する、
 * クライアント側で回復可能な問題の応答モデルを定義する。
 */
namespace problem;

// =========================================
// Problem Response
// =========================================

/**
 * クライアントが利用者に修正・再読み込み・再実行などの
 * 回復手段を提示できる問題を返す HTTP 応答。
 *
 * HTTP status は 422 に固定し、body は RFC 9457 の
 * Problem Details を拡張した JSON として返す。
 *
 * messages は独自拡張フィールドであり、React 側は
 * 画面上部、Toast、Dialog、または該当フォーム項目に表示する。
 */
model ProblemResponse {
  /**
   * HTTP status code。
   *
   * この ProblemResponse は、リクエスト形式は正しいが
   * 入力値または業務条件により処理できない場合に使用する。
   */
  @statusCode
  statusCode: 422;

  /**
   * Problem Details の media type。
   */
  @header
  contentType: "application/problem+json";

  /**
   * 具体的な Problem Details の本文。
   */
  @body
  body: ValidationProblem | BusinessRuleProblem;
}

// =========================================
// Problem Models
// =========================================

/**
 * Problem Details の共通モデル。
 *
 * type は問題種別を識別する URI reference とする。
 * messages は RFC 9457 の標準メンバーではなく、
 * 画面表示およびフォームエラー表示のための独自拡張である。
 *
 * HTTP status は ProblemResponse で常に 422 を返すため、
 * body 内には重複して保持しない。
 */
model Problem {
  /**
   * 問題種別を識別する URI reference。
   *
   * 例:
   * - /problems/validation-error
   * - /problems/business-rule-error
   *
   * クライアントは原則として type による細かな表示分岐をせず、
   * messages を画面へ表示する。
   */
  type: string;

  /**
   * 画面へ表示するエラーメッセージ一覧。
   *
   * 複数の入力項目、または複数の業務ルールに同時に問題がある場合も、
   * まとめて返却できる。
   */
  messages: ProblemMessage[];
}

/**
 * Problem に含めるエラーメッセージ。
 *
 * ProblemResponse は HTTP 422 の失敗応答であるため、
 * level は常に error とする。
 */
model ProblemMessage {
  /**
   * Problem に含まれるメッセージは常にエラーとして扱う。
   */
  level: "error";

  /**
   * 任意のメッセージ識別子。
   */
  code?: string;

  /**
   * 利用者へ表示するエラーメッセージ本文。
   */
  message: string;

  /**
   * メッセージに関連する request body 内の field path。
   *
   * data 内のフォーム項目を指す場合は、
   * "data.name" や "data.items.0.quantity" のように data を起点とする。
   *
   * data の path は通常 React Hook Form の field 名に対応するため、
   * React 側は setError などを利用して該当項目に表示できる。
   *
   * 特定の項目が原因ではないエラーの場合は、fields を未指定にする。
   * その場合、React 側は画面上部、Toast、または Dialog などにエラーメッセージを表示する。
   */
  fields?: string[];
}

// =========================================
// Concrete Problems
// =========================================

/**
 * 入力値単体の妥当性検証に失敗したことを表す Problem。
 *
 * 例:
 * - 必須チェック
 * - 文字数
 * - 形式
 * - 値域
 *
 * 他項目、DB 上のデータ、現在の業務状態に依存しない検証に使用する。
 *
 * 通常、fields には data 内のフォーム項目を指定する。
 */
model ValidationProblem extends Problem {
  /**
   * 入力値の形式・値域・必須性に関する問題種別。
   */
  type: "/problems/validation-error";
}

/**
 * 業務ルール、他項目との関係、または現在の業務状態により
 * Action を実行できないことを表す Problem。
 *
 * 例:
 * - 他項目との相関チェック
 * - 重複登録
 * - 更新期限切れ
 * - 楽観ロック競合
 * - 現在状態では実行できない操作
 *
 * fields は任意である。
 * 業務エラーでも特定フォーム項目に関連付けて表示できる場合は指定し、
 * 画面全体または Action 実行自体に関する問題であれば省略する。
 */
model BusinessRuleProblem extends Problem {
  /**
   * 業務ルールまたは業務状態に関する問題種別。
   */
  type: "/problems/business-rule-error";
}
