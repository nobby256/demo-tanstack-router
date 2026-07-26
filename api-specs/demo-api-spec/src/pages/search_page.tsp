import "@typespec/http";
import "@vendor/typespec-validation";

using Http;

/**
 * 一覧画面
 */
@tag("search-page")
@route("/api/search-page")
namespace demo.search_page {
  @post
  @route("/load")
  op load(@bodyRoot body: LoadInput): LoadOutput;

  /**
   * loadの引数
   */
  model LoadInput {}

  /**
   * loadの戻り値
   */
  model LoadOutput {}

  // ============================================
  // モデル
  // =========
}
