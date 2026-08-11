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

model ViewModelData {}

model ViewModel is viewmodel.ViewModel<ViewModelData>;

// =========================================
// Operations
// =========================================

@post
@route("/load")
op load(@bodyRoot body: LoadInput): ViewModel;

/**
 * loadの引数
 */
model LoadInput {}

// ============================================
// モデル
// =========
