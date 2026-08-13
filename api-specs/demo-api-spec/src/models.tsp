namespace models;

/**
 * 画面表示モデルの基底モデル。
 */
model ViewModel {
  /** 選択肢。 */
  selectors?: Record<SelectOption[]>;
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
