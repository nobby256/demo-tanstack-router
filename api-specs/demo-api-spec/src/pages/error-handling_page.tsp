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

model ViewModel extends viewmodel.ViewModelBase {
  data: {
    /** id */
    status: string;
  };
}

model ActionModel<TArgs extends {} = never>
  extends viewmodel.ActionModelBase<TArgs> {
  data: {
    /** id */
    status: int32;
  };
}

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
  | viewmodel.ActionResult
  | problem.ProblemResponse;
