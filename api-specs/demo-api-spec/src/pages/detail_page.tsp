import "@typespec/http";
import "@vendor/typespec-validation";
import "./common.tsp";

using TypeSpec.Http;

/**
 * 詳細画面
 */
@tag("detail-page")
@route("/api/detail-page")
namespace demo.detail_page;

// =========================================
// load
// =========================================

model LoadInput {
  /** id */
  id: string;
}

model ViewModel {
  /** id */
  id: string;

  /** name */
  name: string;

  /** num */
  num: string;

  /** description */
  description: string;

  /** version */
  version: int64;
}

model LoadOutput is LoadResponse<ViewModel>;

@post
@route("/load")
@opExample(#{
  returnType: #{
    statusCode: 200,
    body: #{
      data: #{
        id: "1",
        name: "Item 1",
        num: "123.45",
        description: "This is item 1",
        version: 1,
      },
    },
  },
})
op load(@bodyRoot body: LoadInput): LoadOutput;

// =========================================
// update
// =========================================

model UpdateInput {
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
}

model UpdateOutput is ActionResponse<never>;

@post
@route("/update")
op update(@bodyRoot body: UpdateInput): UpdateOutput | ProblemResponse;
