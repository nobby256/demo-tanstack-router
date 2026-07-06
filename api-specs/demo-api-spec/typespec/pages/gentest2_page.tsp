import "@typespec/http";
import "@typespec/openapi";
import "@vendor/typespec-validation";

using Http;
using OpenAPI;

/**
 * 詳細画面API
 */
@info(#{ title: "PG004", version: "0.0.0" })
@tag("Gentes2tPage")
@service
@route("/api/gentest2-page")
namespace gentest2_page {
  /**
   * GET API
   */
  @get
  @route("/get")
  op get(
    @query
    id: string,

    @query
    name: string,

    /**
     * decimal（DSLで扱う想定）
     */
    @decimal({
      precision: 5,
      scale: 2,
    })
    @query
    num: string,

    @query
    description?: string,

    @query
    version: int64,

    /**
     * 正規表現
     */
    @pattern("^[a-z]+$")
    @query
    patternTest?: string,

    /**
     * サイズ制約
     */
    @minLength(3)
    @maxLength(10)
    @query
    sizeTest?: string,

    /**
     * 配列制約
     */
    @query
    arrayTest?: string[],

    /**
     * int制約
     */
    @minValue(1)
    @maxValue(10)
    @query
    integerTest?: int32,

    /**
     * long制約
     */
    @minValue(1)
    @maxValue(10)
    @query
    longTest?: int64,

    /**
     * decimal範囲
     */
    @minValue(0.1)
    @maxValue(99.9)
    @query
    decimalTest?: float64,

    /**
     * exclusiveTest
     */
    @minValueExclusive(0)
    @maxValueExclusive(100)
    @query
    exclusiveTest?: float64,
  ): void;

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
    id: string;
    name: string;

    /**
     * decimal（DSLで扱う想定）
     */
    @decimal({
      precision: 5,
      scale: 2,
    })
    num: string;

    description?: string;
    version: int64;

    /**
     * 正規表現
     */
    @pattern("^[a-z]+$")
    patternTest?: string;

    /**
     * サイズ制約
     */
    @minLength(3)
    @maxLength(10)
    sizeTest?: string;

    /**
     * 配列制約
     */
    arrayTest?: string[];

    /**
     * int制約
     */
    @minValue(1)
    @maxValue(10)
    integerTest?: int32;

    /**
     * long制約
     */
    @minValue(1)
    @maxValue(10)
    longTest?: int64;

    /**
     * decimal範囲
     */
    @minValue(0.1)
    @maxValue(99.9)
    decimalTest?: float64;

    /**
     * exclusiveMinimum
     */
    @minValue(0)
    @extension("exclusiveMinimum", true)
    exclusiveTest?: float64;
  }
}
