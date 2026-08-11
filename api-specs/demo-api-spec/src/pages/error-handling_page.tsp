import "@typespec/http";
import "../viewmodel.tsp";
import "../problem.tsp";

using Http;

@tag("error-handling-page")
@route("/api/error-handling-page")
namespace demo.error_handling_page;

// =========================================
// Screen Models
// =========================================

model ViewModelData {
  /** id */
  status: string;
}

model ViewModel is viewmodel.ViewModel<ViewModelData>;

model ActionModelData {
  /** id */
  status: int32;
}

model ActionModel is viewmodel.ActionModel<ActionModelData, never>;

// =========================================
// Operations
// =========================================

@post
@route("/load")
@opExample(#{ returnType: #{ data: #{ status: "" } } })
op load(@bodyRoot body: LoadInput): ViewModel;

model LoadInput {
  status?: string;
}

@post
@route("/done")
@opExample(#{ returnType: #{} })
op done(@bodyRoot body: ActionModel):
  | viewmodel.ActionResult<never>
  | problem.ProblemResponse;
