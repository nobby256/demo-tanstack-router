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

model ViewModel extends viewmodel.ViewModelBase {
  data: {
    /** id */
    id: string;

    /** name */
    name: string;

    /** num */
    num: string;

    /** description */
    description: string;

    /** version */
    version: string;
  };
}

model ActionModel<TArgs extends {} = never>
  extends viewmodel.ActionModelBase<TArgs> {
  data: {
    /** id */
    id: string;

    /** name */
    name: string;

    /** num */
    num: string;

    /** description */
    description?: string;

    /** version */
    version: int64;
  };
}

// =========================================
// ViewModel Operations
// =========================================

/**
 * load operation の入力。
 *
 * id 未指定時は新規作成用の初期 ViewModel を返す。
 */
model LoadInput {
  id?: string;
}

/**
 * load operation。
 */
@post
@route("/load")
@opExample(#{
  returnType: #{
    data: #{
      id: "1",
      name: "Item 1",
      num: "123.45",
      description: "This is item 1",
      version: "1",
    },
  },
})
op load(@bodyRoot body: LoadInput): ViewModel;

// =========================================
// ActionModel Operations
// =========================================

/**
 * update operation。
 */
@post
@route("/update")
op update(@bodyRoot body: ActionModel):
  | viewmodel.ActionResult
  | problem.ProblemResponse;

// =========================================
// Other Operations
// =========================================
