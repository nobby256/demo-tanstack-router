import "@typespec/http";

using Http;

@tag("error-handling-page")
@route("/api/error-handling-page")
namespace service.error_handling_page;

// =========================================
// Screen Models
// =========================================

model ViewModel is ViewModelBase {
  data: view.Data;
}

// ViewModelの内部モデル用ネームスペース
namespace view {
  model Data {
    /** status */
    status?: string = "";

    // check: boolean;
  }
}

model MutationModel {
  data: mut.Data;
}

// MutationModelの内部モデル用ネームスペース
namespace mut {
  model Data {
    /** status */
    status: int32;

    // check: boolean;
  }
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
