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

model ViewModelData {
  /** id */
  id: string;

  /** name */
  name: string;
}

model ViewModel is viewmodel.ViewModel<ViewModelData[]>;

model ActionModelData {
  /** id */
  id: string;

  /** name */
  name: string;
}

model ActionModel is viewmodel.ActionModel<ActionModelData[], never>;

@post
@route("/load")
@opExample(#{
  returnType: #{
    data: #[#{ id: "1", name: "Item 1" }, #{ id: "2", name: "Item 2" }],
  },
})
op load(@bodyRoot body: LoadInput): ViewModel;

model LoadInput {
  keyword?: string;
  category?: string;
}
