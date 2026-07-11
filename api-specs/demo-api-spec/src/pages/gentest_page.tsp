import "@typespec/http";
import "@typespec/openapi";
import "@vendor/typespec-validation";

using OpenAPI;
using Http;

/**
 * ジェネレートテスト画面
 */
@info(#{ title: "PG003", version: "1.0.0" })
@tag("GentestPage")
@service
@route("/api/gentest-page")
namespace gentest_page {
  /**
   * 列挙体
   */
  enum Status {
    Active,
    Inactive,
  }

  /**
   * ネストされるクラス
   */
  model Address {
    city: string;
    zip: string;
  }

  /**
   * メインテストモデル
   */
  model TestModel {
    /** オプショナル */
    name: string = "name";

    /** 必須項目（BeanValidation NotNull） */
    id: string;

    /** 列挙型 */
    status: Status;

    /** 列挙型（インライン） */
    inlineStatus: "Active" | "Inactive";

    /** 数値（int） */
    count: int32;

    /** 数値（long） */
    version: int64;

    /** カスタムDSL（decimal） */
    @decimal({
      precision: 5,
      scale: 2,
    })
    amount: string;

    /** 単純な配列 */
    values: string[];

    /** オブジェクト */
    address: Address;

    /** オブジェクト配列 */
    addresses: Address[];

    /** 多次元配列 */
    matrix: string[][];

    /** オブジェクト多次元配列 */
    complex: Address[][];

    /** Optional */
    description?: string;
  }

  /**
   * POST（引数なし）
   */
  @post
  @route("/test")
  op createWithoutBody(): TestModel;

  /**
   * POST（DTO入力）の引数
   */
  model CreateRequest {
    /** id */
    id: string;

    /** name */
    name: string;

    /** decimal */
    @decimal({
      precision: 5,
      scale: 2,
    })
    amount: string;
  }

  /**
   * POST（DTO入力）
   */
  @post
  @route("/test_with_body")
  op createWithBody(
    /** body */
    @bodyRoot body: CreateRequest,
  ): TestModel;

  /**
   * POST（戻り値void）
   */
  @post
  @route("/test_update")
  op update(): void;

  /**
   * GET（基本パターン）
   */
  @get
  @route("/get/simple")
  op getSimple(
    /** id */
    @query id: string,

    /** name */
    @query name: string,
  ): TestModel;

  /**
   * GET（数値・範囲系）
   */
  @get
  @route("/get/numeric")
  op getNumeric(
    /** count */
    @query count: int32,

    /** version */
    @query version: int64,
  ): TestModel;

  /**
   * GET（配列）
   */
  @get
  @route("/get/array")
  op getArray(
    /** values */
    @query values: string[],
  ): TestModel;

  /**
   * GET（オプショナル）
   */
  @get
  @route("/get/optional")
  op getOptional(
    /** name */
    @query name?: string = "name",

    /** description */
    @query description?: string = "description",
  ): TestModel;

  /**
   * GET（Enum）
   */
  @get
  @route("/get/enum")
  op getEnum(
    /** status */
    @query status: Status,

    /** inlineStatus */
    @query inlineStatus: "Active" | "Inactive",
  ): TestModel;

  /**
   * GET（複合パラメータ）の引数
   */
  model SearchCondition {
    /** id */
    @query id?: string;

    /** name */
    @query name?: string;

    /** count */
    @query count?: int32;
  }

  /**
   * GET（複合パラメータ）
   */
  @get
  @route("/get/complex")
  op getComplex(...SearchCondition): TestModel;

  /**
   * POST（ヘッダ）
   */
  @post
  @route("/post/heades")
  op headers(
    // ✅ HeaderParam
    @header("X-Request-Id") requestId: string,

    // ✅ Header + default value
    @header("X-Lang") lang?: string = "ja",
  ): void;

  /**
   * POST（マルチパート）
   */
  @post
  @route("/post/multipart")
  op multipart(
    // ✅ body
    @multipartBody body: UploadRequest,
  ): void;

  /**
   * マルチパート
   */
  model UploadRequest {
    /** name */
    name: HttpPart<string>;

    /** optional（HttpPartにはデフォルト値は付けられない） */
    optional?: HttpPart<string>;

    /** bytes */
    file: HttpPart<bytes>;
  }
}
