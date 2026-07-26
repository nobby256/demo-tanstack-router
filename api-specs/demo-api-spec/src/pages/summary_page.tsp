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
    returnType: #{
      data: #[#{ id: "1", name: "Item 1" }, #{ id: "2", name: "Item 2" }],
    },
  })
  op load(@bodyRoot body: LoadInput): LoadOutput;

  /**
   * loadの引数
   */
  model LoadInput {
    keyword?: string;
    category?: string;
  }

  /**
   * loadの戻り値
   */
  model LoadOutput {
    data: SummaryItem[];
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
