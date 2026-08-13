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

model ViewModel extends models.ViewModelBase {
  data: {
    keyword?: string = "";
    category?: string = "";
  };
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
