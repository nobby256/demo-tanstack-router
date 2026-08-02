import "@typespec/http";

using Http;

/**
 * 一覧画面
 */
@tag("error-handling-page")
@route("/api/error-handling-page")
namespace demo.error_handling_page {
  @post
  @route("/load")
  @opExample(#{ returnType: #{ data: #{} } })
  op load(@bodyRoot body: LoadInput): LoadOutput;

  model LoadInput {
    status?: int32;
  }

  model LoadOutput {
    data: ErrorHandlingItem;
  }

  @post
  @route("/done")
  @opExample(#{ returnType: #{} })
  op done(@bodyRoot body: DoneInput): DoneOutput;

  model DoneInput {
    status: int32;
  }

  model DoneOutput {}

  // ============================================
  // モデル
  // =========
  model ErrorHandlingItem {
    status?: int32;
  }
}
