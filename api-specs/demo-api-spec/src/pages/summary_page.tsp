import "@typespec/http";
import "@vendor/typespec-validation";

using OpenAPI;
using Http;

/**
 * 一覧画面
 */
@tag("summary-page")
@route("/api/summary-page")
namespace demo.summary_page {
  /**
   * ロード
   */
  @post
  @route("/load")
  @opExample(#{
    returnType: #[#{ id: "1", name: "Item 1" }, #{ id: "2", name: "Item 2" }],
  })
  op load(@bodyRoot body: LoadBody): SummaryItem[];

  /**
   * ロードの引数
   */
  model LoadBody {
    keyword?: string;
    category?: string;
  }

  // ============================================
  // モデル
  // =========

  /**
   * 一覧
   */
  model SummaryItem {
    /** id */
    id: string;

    /** name */
    name: string;
  }
}
