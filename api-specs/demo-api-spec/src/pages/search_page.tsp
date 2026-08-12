import "@typespec/http";
import "@vendor/typespec-validation";

using Http;

/**
 * 一覧画面
 */
@tag("search-page")
@route("/api/search-page")
namespace demo.search_page;

// =========================================
// Screen Models
// =========================================

model ViewModel extends viewmodel.ViewModelBase {
  data: {
    keyword?: string = "";
    category?: string = "";
  };
}

// =========================================
// ViewModel Operations
// =========================================

/**
 * load operation の入力。
 */
model LoadInput {}

/**
 * load operation。
 */
@post
@route("/load")
@opExample(#{ returnType: #{ data: #{ keyword: "", category: "" } } })
op load(@bodyRoot body: LoadInput): ViewModel;

// =========================================
// ActionModel Operations
// =========================================

// =========================================
// Other Operations
// =========================================
