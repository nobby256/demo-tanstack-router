import "@typespec/http";

using Http;

@tag("error-handling-page")
@route("/api/error-handling-page")
namespace service.error_handling_page;

// =========================================
// Screen Models
// =========================================

model ViewModel is ViewModelBase {
  data: {
    /** status */
    status?: string = "";

    // check: boolean;
  };
}

model MutationModel {
  data: {
    /** status */
    status: int32;

    // check: boolean;
  };
}

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
op done(@bodyRoot body: MutationModel): ResultModel;

@post
@route("/done2")
op done2(
  @bodyRoot body: MutationModel,
  @query hoge?: string,
  @query hoge2?: int32,
): ResultModel;

// =========================================
// Other Operations
// =========================================
