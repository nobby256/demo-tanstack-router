import "@typespec/http";

using TypeSpec.Http;

// =========================================
// Form Action Input
// =========================================

/**
 * 固有引数を持たない Form Action の共通 Input。
 *
 * Form Action は、画面固有の ActionModel を入力として受け取る
 * サーバー Action である。
 *
 * ActionModel のプロパティは HTTP body のトップレベルへ展開される。
 * そのため、ProblemMessage.fields の値を React Hook Form の field 名へ
 * そのまま対応付けられる。
 *
 * @example
 * model UpdateInput is FormActionInput<ActionModel>;
 */
model FormActionInput<TActionModel extends {}> {
  ...TActionModel;
}

/**
 * 固有引数を持つ Form Action の共通 Input。
 *
 * Form Action は、画面の現在の ActionModel と、
 * operation 固有の actionArgs を入力として受け取る。
 *
 * actionArgs は Form Action 固有引数のための予約プロパティである。
 * ActionModel および ViewModel では actionArgs を定義してはならない。
 *
 * TActionModel のプロパティは HTTP body のトップレベルへ展開される。
 * 固有引数だけを actionArgs 配下へ隔離することで、
 * ActionModel のプロパティ名との衝突を防ぐ。
 *
 * @example
 * model CalculateInput is FormActionInputWithArgs<
 *   ActionModel,
 *   CalculateActionArgs
 * >;
 */
model FormActionInputWithArgs<TActionModel extends {}, TActionArgs extends {}> {
  ...TActionModel;

  /** operation 固有引数 */
  actionArgs: TActionArgs;
}

// =========================================
// HTTP Response
// =========================================

/**
 * load operation の正常応答。
 *
 * HTTP 200 で、画面の初期表示・再表示に必要な Page View Model を返す。
 * operation 固有の Output は、この model を is で具体化する。
 *
 * @example
 * model LoadOutput is LoadResponse<ViewModel>;
 */
model LoadResponse<T> {
  @statusCode
  statusCode: 200;

  @body
  body: PageViewModel<T>;
}

/**
 * Action operation の正常応答。
 *
 * Form Action と、固有 Input を受け取る Action の双方で使用する。
 * HTTP 200 で、Action の実行結果と画面表示用メッセージを返す。
 *
 * operation 固有の Output は、この model を is で具体化する。
 *
 * @example
 * model UpdateOutput is ActionResponse<never>;
 * model CalculateOutput is ActionResponse<CalculateResult>;
 */
model ActionResponse<T> {
  @statusCode
  statusCode: 200;

  @body
  body: ActionResult<T>;
}

/**
 * クライアントが修正可能な問題を返す応答。
 *
 * HTTP 422 と application/problem+json を固定する。
 * React 側は messages を画面上部または該当フォーム項目に表示する。
 */
model ProblemResponse {
  @statusCode
  statusCode: 422;

  @header
  contentType: "application/problem+json";

  @body
  body: ValidationProblem | BusinessRuleProblem;
}

// =========================================
// Problem Details
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
 * 他項目・DB上のデータ・業務状態に依存しない検証に使用する。
 */
model ValidationProblem {
  type: "/problems/validation-error";
  messages: ProblemMessage[];
}

/**
 * 業務ルールまたは現在の業務状態により処理できないことを表す Problem。
 *
 * 例:
 * - 他項目との相関チェック
 * - 重複登録
 * - 更新期限切れ
 * - 現在状態では実行できない操作
 *
 * fields は任意であり、業務エラーでも特定項目に紐付けて表示できる。
 */
model BusinessRuleProblem {
  type: "/problems/business-rule-error";
  messages: ProblemMessage[];
}

// =========================================
// Page View Model
// =========================================

/**
 * load operation 専用の画面表示モデル。
 *
 * 画面にバインドするデータと、ドロップダウン等の選択肢をまとめる。
 * T には画面固有の ViewModel を指定する。
 *
 * @example
 * model LoadOutput is LoadResponse<UserEdit.ViewModel>;
 */
model PageViewModel<T> {
  /** 画面にバインドするデータ */
  data: T;

  /**
   * UI セレクタの選択肢一覧。
   *
   * キーは画面内で定義したセレクタ名を表す。
   * 例: "roleCode", "prefectureCode"
   */
  selectors?: Record<SelectOption[]>;
}

/**
 * セレクトボックス、コンボボックス等で使用する選択肢。
 *
 * value は送受信・フォーム値として使用する値、
 * label は画面に表示する文言を表す。
 */
model SelectOption {
  value: string;
  label: string;
}

// =========================================
// Action Result
// =========================================

/**
 * Action operation の正常な実行結果。
 *
 * data には operation 固有の結果データを格納する。
 * data を返さない operation では ActionResult<never> を使用する。
 *
 * messages は、Action 完了後に画面へ表示する情報または警告である。
 * エラーは ProblemResponse で返すため、ここには含めない。
 */
model ActionResult<T> {
  data?: T;
  messages: ActionMessage[];
}

// =========================================
// Messages
// =========================================

/**
 * 画面に表示するメッセージの共通モデル。
 *
 * ActionMessage と ProblemMessage の基底型。
 * code は画面表示以外の識別やログ相関が必要になった場合に利用できるが、
 * クライアントが code による分岐を行うかは個別の API 規約で定める。
 */
model Message {
  level: "info" | "warn" | "error";
  code?: string;
  message: string;

  /**
   * メッセージに関連する request body の field path。
   *
   * ProblemMessage でのみ使用する。
   * 通常は React Hook Form の field 名と一致させる。
   *
   * Form Action 固有引数を指す場合は、
   * "actionArgs.targetRowIndex" のように actionArgs を起点とする。
   */
  fields?: string[];
}

/**
 * 正常終了した Action の完了メッセージ。
 *
 * ActionResponse は HTTP 200 の正常応答であるため、
 * error レベルおよび fields の指定は許可しない。
 */
model ActionMessage extends Message {
  level: "info" | "warn";
  fields?: never;
}

/**
 * Problem に含まれるエラーメッセージ。
 *
 * HTTP 422 の応答では error レベルを必須とする。
 * fields を指定した場合、React 側は該当フォーム項目のエラー表示に利用できる。
 */
model ProblemMessage extends Message {
  level: "error";
}
