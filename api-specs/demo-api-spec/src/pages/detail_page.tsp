import "@typespec/http";
import "@vendor/typespec-validation";

using TypeSpec.Http;

/**
 * 詳細画面
 */
@tag("detail-page")
@route("/api/detail-page")
namespace demo.detail_page;

// =========================================
// Screen Models
// =========================================

model ViewModelData {
  /** id */
  id: string;

  /** name */
  name?: string = "";

  /** num */
  num?: string = "";

  /** description */
  description?: string = "";

  /** version */
  version: int64;
}

model MutationModelData {
  /** id */
  id: string;

  /** name */
  name: string;

  /** num */
  num: int32;

  /** description */
  description?: string;

  /** version */
  version: int64;
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
@opExample(#{
  returnType: #{
    data: #{
      id: "1",
      name: "Item 1",
      num: "123.45",
      description: "This is item 1",
      version: 1,
    },
  },
})
op load(
  @bodyRoot body: {
    id?: string;
  },
): ViewModel;

// =========================================
// MutationModel Operations
// =========================================

@post
@route("/update")
op update(@bodyRoot body: MutationModel): models.ResultModel;

// =========================================
// Other Operations
// =========================================
