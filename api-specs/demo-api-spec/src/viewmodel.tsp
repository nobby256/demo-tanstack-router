namespace viewmodel;

// =========================================
// View Model
// =========================================

/**
 * 画面の初期表示および表示状態を表す共通の基底モデル。
 *
 * load Action の応答で使用する。
 * 各画面は ViewModelBase を継承し、data を画面固有の model または配列へ
 * override する。
 *
 * selectors および画面固有のマスタデータ、権限、表示補助情報などは、
 * 必要に応じて各画面の ViewModel に追加する。
 */
model ViewModelBase {
  /**
   * 画面の主データ。
   *
   * 表示値、編集値、画面状態など、その画面の中心となるデータを表す。
   * 具体的な型は各画面の ViewModel で定義する。
   *
   * data は model、配列、またはそれらを組み合わせた構造を取り得る。
   *
   * フォーム画面では、通常 data または data 内のフォーム対象 subtree を
   * React Hook Form の defaultValues に使用する。
   */
  data: unknown;

  /**
   * 画面内の select、radio、combobox などで使用する選択肢。
   *
   * key には画面内で識別可能な selector 名を使用する。
   * selectors は表示補助データであり、通常は Action request に含めない。
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
   * API および画面内部で扱う値。
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
 * Form Action の request body を表す共通の基底モデル。
 *
 * 各画面は ActionModelBase を継承し、data をその画面の
 * ActionModelData へ override する。
 *
 * data には、更新・登録・削除などの Action を実行するために
 * サーバーへ送信してよいデータだけを含める。
 * ViewModel に存在する表示専用データ、selectors、画面固有のマスタデータは
 * 通常 data に含めない。
 *
 * actionArgs は、Action ごとに異なる補助引数を表す。
 * たとえば、押下した行の index、実行モード、現在の UI 状態などを
 * API 呼出時にプログラムで付与する。
 *
 * TArgs に never を指定した場合、その Action は actionArgs を持たない。
 *
 * HTTP request に含まれる data および actionArgs は、クライアントが生成した値でも
 * 信頼できる値ではない。サーバーは型、必須性、値域、権限、業務状態との整合性を
 * 必ず検証する。
 */
model ActionModelBase<TArgs extends {} = never> {
  /**
   * Action 実行時に送信する主データ。
   *
   * 具体的な型は各画面の ActionModel で定義する。
   * data は model、配列、またはそれらを組み合わせた構造を取り得る。
   */
  data: unknown;

  /**
   * Action 固有の補助引数。
   *
   * 通常のフォーム入力は data に置く。
   * actionArgs は、Action 実行時の文脈や UI 状態など、
   * data とは別に必要となる補助情報に使用する。
   *
   * TArgs が never の場合、実質的に actionArgs は使用しない。
   */
  actionArgs?: TArgs;
}

/**
 * 正常終了した Action の応答。
 *
 * data は、再計算結果、部分更新結果、遷移先情報、
 * 再取得した ViewModel などを返す必要がある場合に使用する。
 *
 * data を返さない Action は ActionResult<never> を使用する。
 * messages は、完了通知または警告を画面に表示する必要がある場合だけ返す。
 */
model ActionResult<TData = never> {
  /**
   * Action 成功後に画面へ返す任意のデータ。
   *
   * TData が never の場合、data を返さない Action を表す。
   */
  data?: TData;

  /**
   * 画面に表示する成功または警告メッセージ。
   *
   * 表示するメッセージがない場合は省略する。
   */
  messages?: Message[];
}

/**
 * 正常終了した Action の応答に含める画面表示メッセージ。
 */
model Message {
  /**
   * 画面上の表示レベル。
   *
   * ActionResult は正常応答のため、error は使用しない。
   */
  level: "info" | "warn";

  /**
   * 任意の機械可読なメッセージ識別子。
   *
   * ログ相関、計測、画面固有の制御などに利用できる。
   * クライアントが code による分岐を行うかは個別 API の規約で定める。
   */
  code?: string;

  /**
   * 利用者へ表示するメッセージ本文。
   */
  message: string;
}
