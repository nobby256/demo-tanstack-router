import "@typespec/http";
import "@vendor/typespec-validation";

using TypeSpec.Http;

/**
 * 詳細画面
 */
@tag("detail-page")
@route("/api/detail-page")
namespace service.detail_page;

// =========================================
// Screen Models
// =========================================

model ViewModel is ViewModelBase {
  data: {
    /** id */
    id: string;

    /** name */
    name?: string = "";

    /** description */
    description?: string = "";

    /** version */
    version: int64;
  };
}

// ViewModelの内部モデル用ネームスペース
namespace view {

}

model MutationModel {
  data: {
    /** id */
    id: string;

    /** name */
    name: string;

    /** description */
    description?: string;

    /** version */
    version: int64;
  };
}

// MutationModelの内部モデル用ネームスペース
namespace mut {

}

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
op update(@bodyRoot body: MutationModel): ResultModel;

// =========================================
// Other Operations
// =========================================
