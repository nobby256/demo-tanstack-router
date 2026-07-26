import "@typespec/http";
import "@vendor/typespec-validation";

using Http;

/**
 * 詳細画面
 */
@tag("detail-page")
@route("/api/detail-page")
namespace demo.detail_page;

/**
 * ロード
 */
@post
@route("/load")
@opExample(#{
  returnType: #{
    data: #{
      id: "1",
      name: "Item 1",
      num: "123.45",
      description: "This is item 1",
      version: 1,
    },
  },
})
op load(@bodyRoot body: LoadInput): LoadOutput;

/**
 * loadの引数
 */
model LoadInput {
  /** id */
  id: string;
}

/**
 * loadの戻り値
 */
model LoadOutput {
  data: DetailItem;
}

/**
 * 更新
 */
@post
@route("/update")
op update(@bodyRoot body: UpdateInput): NoContentResponse;

/**
 * 更新の引数
 */
model UpdateInput {
  /** id */
  id: string;

  /** name */
  name: string;

  /** num */
  @decimal({
    precision: 5,
    scale: 2,
  })
  num: string;

  /** description */
  description?: string;

  /** version */
  version: int64;
}

// ============================================
// モデル
// =========

/**
 * 詳細
 */
model DetailItem {
  /** id */
  id: string;

  /** name */
  name: string;

  /** num */
  num: string;

  /** description */
  description?: string;

  /** version */
  version: int64;
}
