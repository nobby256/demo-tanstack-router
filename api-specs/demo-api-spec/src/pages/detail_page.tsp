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
    id: "1",
    name: "Item 1",
    num: "123.45",
    description: "This is item 1",
    version: 1,
  },
})
op load(@bodyRoot body: LoadBody): DetailItem;

/**
 * ロードの引数
 */
model LoadBody {
  /** id */
  id: string;
}

/**
 * 更新
 */
@post
@route("/update")
op update(@bodyRoot body: UpdateBody): NoContentResponse;

/**
 * 更新の引数
 */
model UpdateBody {
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
