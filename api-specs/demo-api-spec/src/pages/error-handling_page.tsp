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
  /** status */
  status?: string = "";

  // check: boolean;
}

model MutationModelData {
  /** status */
  status: int32;

  // check: boolean;
}

model ViewModel extends models.ViewModel<ViewModelData> {
  // none
}
model MutationModel is models.MutationModel<MutationModelData>;

// =========================================
// ViewModel Operations
// =========================================

@post
@route("/load")
@opExample(#{ returnType: #{ data: #{ status: "" } } })
op load(
  @bodyRoot body: {
    status?: string;
  },
): ViewModel;

// =========================================
// MutationModel Operations
// =========================================

@post
@route("/done")
op done(@bodyRoot body: MutationModel): models.ResultModel;

@post
@route("/done2")
op done2(
  @bodyRoot body: models.MutationModel<
    MutationModelData,
    {
      param: string;
    }
  >,
): models.ResultModel;

// =========================================
// Other Operations
// =========================================
