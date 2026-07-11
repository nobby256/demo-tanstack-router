import "@typespec/http";
import "@typespec/openapi";
import "@vendor/typespec-validation";

using Http;
using OpenAPI;

/**
 * デコレータのテスト
 */
@info(#{ title: "PG005", version: "0.0.0" })
@tag("Gentest3Page")
@service
@route("/api/gentest3-page")
namespace gentest3_page {
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
