import "@typespec/http";
import "@typespec/openapi";
import "@vendor/typespec-validation";

using Http;
using OpenAPI;

/**
 * デコレータのテスト2
 */
@tag("gentest3-page")
@route("/api/gentest3-page")
namespace demo.gentest3_page {
  /**
   * POST API
   */
  @post
  @route("/post")
  op post(
    /** body */
    @bodyRoot body: UpdateBody,
  ): void;

  /**
   * 更新APIの入力モデル
   */
  model UpdateBody {
    @decimal({})
    value1: string;

    @decimal({})
    value2: string[];

    @decimal({})
    value3: string[][];
  }
}
