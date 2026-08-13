namespace models;

/**
 * 画面表示モデル。
 */
model ViewModel<TData> {
  /** 表示データ。 */
  data: TData;

  /** 選択肢。 */
  selectors?: Record<SelectOption[]>;
}

/**
 * 操作実行モデル。
 */
model MutationModel<TData, TArgs extends {} = never> {
  /** 送信データ。 */
  data: TData;

  /** 操作引数。 */
  args?: TArgs;
}

/**
 * 選択肢モデル。
 */
model SelectOption {
  /** 値。 */
  value: string;

  /** 表示名。 */
  label: string;
}

/**
 * 正常応答モデル。
 */
model ResultModel<TData = never, TMessages = ResultMessage[]> {
  /** 応答データ。 */
  data?: TData;

  messages?: TMessages;
}

/** 応答メッセージ。 */
model ResultMessage {
  /** レベル。 */
  level: "info" | "warn";

  /** 識別子。 */
  code?: string;

  /** メッセージ。 */
  message: string;
}
