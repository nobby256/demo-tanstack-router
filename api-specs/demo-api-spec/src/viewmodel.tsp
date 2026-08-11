namespace viewmodel;

// =========================================
// View Model
// =========================================

/**
 * 画面の初期表示および表示状態を表す共通モデル。
 *
 * load Action の応答として使用する。
 * data は画面の主データ、selectors は選択肢などの補助データを表す。
 *
 * React 側では、通常 data を React Hook Form の defaultValues に使用する。
 */
model ViewModelBase {
  /**
   * 画面の主データ。
   *
   * 各画面の ViewModel で具体的な model または配列に override する。
   */
  data: unknown;

  /**
   * 画面内の select、radio、combobox などで使用する選択肢。
   *
   * key には画面内で識別可能な selector 名を使用する。
   *
   * 例:
   * {
   *   status: [
   *     { value: "draft", label: "下書き" },
   *     { value: "published", label: "公開" },
   *   ],
   * }
   */
  selectors?: Record<SelectOption[]>;
}

/**
 * 選択肢の共通モデル。
 */
model SelectOption {
  /**
   * API と画面内部で扱う値。
   */
  value: string;

  /**
   * 利用者へ表示するラベル。
   */
  label: string;
}

// =========================================
// Action Model
// =========================================

/**
 * Form Action の request body を表す共通モデル。
 *
 * data はフォームの正規入力値であり、React Hook Form による
 * クライアント側検証の対象とする。
 *
 * actionArgs は Action 実行時の補助情報である。
 * たとえば、押下された行の index、実行モード、現在の UI 状態などを
 * API 呼出時にプログラムで付与する。
 *
 * TArgs に never を指定した場合、actionArgs を持たない ActionModel として使う。
 *
 * actionArgs は HTTP request に含まれる以上、クライアントで生成した値であっても
 * サーバー側で必ず検証する。
 */
model ActionModelBase<TArgs extends {} = never> {
  /**
   * Action で送信する主データ。
   *
   * 各画面の ActionModel で具体的な model または配列に override する。
   */
  data: unknown;

  /**
   * Action 固有の補助引数。
   */
  actionArgs?: TArgs;
}

/**
 * 正常終了した Action の応答。
 *
 * data は、再計算結果、部分更新結果、遷移先情報など、
 * Action 後に画面へ返す必要がある場合だけ使用する。
 *
 * data が不要な Action は ActionResult<never> を使用する。
 * messages は成功・警告メッセージを返す場合に配列として返す。
 */
model ActionResult<TData = never> {
  /**
   * Action 成功後に画面へ返す任意のデータ。
   */
  data?: TData;

  /**
   * 画面に表示する成功または警告メッセージ。
   */
  messages?: Message[];
}

/**
 * 画面に表示するメッセージモデル。
 */
model Message {
  /**
   * 画面上の表示レベル。
   */
  level: "info" | "warn";

  /**
   * 任意のメッセージ識別子。
   */
  code?: string;

  /**
   * 利用者へ表示するメッセージ本文。
   */
  message: string;
}
