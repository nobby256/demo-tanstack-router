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

model ViewModelData {
  keyword?: string = "";
  category?: string = "";
}

model ViewModel extends models.ViewModel<ViewModelData> {
  // none
}

// =========================================
// ViewModel Operations
// =========================================

@post
@route("/load")
@opExample(#{ returnType: #{ data: #{ keyword: "", category: "" } } })
op load(@bodyRoot body: {}): ViewModel;

// =========================================
// MutationModel Operations
// =========================================

// =========================================
// Other Operations
// =========================================
