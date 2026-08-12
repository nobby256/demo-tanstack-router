import "@typespec/http";
import "@vendor/typespec-validation";

using Http;

/**
 * 一覧画面
 */
@tag("summary-page")
@route("/api/summary-page")
namespace demo.summary_page;

// =========================================
// Screen Models
// =========================================

model ViewModel extends viewmodel.ViewModelBase {
  data: {
    /** id */
    id: string;

    /** name */
    name?: string = "";
  }[];
}

// =========================================
// ViewModel Operations
// =========================================

/**
 * load operation の入力。
 */
model LoadInput {
  keyword?: string;
  category?: string;
}

/**
 * load operation。
 */
@post
@route("/load")
@opExample(#{
  returnType: #{
    data: #[#{ id: "1", name: "Item 1" }, #{ id: "2", name: "Item 2" }],
  },
})
op load(@bodyRoot body: LoadInput): ViewModel;

// =========================================
// ActionModel Operations
// =========================================

// =========================================
// Other Operations
// =========================================
