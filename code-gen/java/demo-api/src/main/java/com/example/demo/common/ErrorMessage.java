package com.example.demo.common;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * エラーメッセージ。
 */
@JsonPropertyOrder({
    ErrorMessage.JSON_PROPERTY_SEVERITY,
    ErrorMessage.JSON_PROPERTY_CODE,
    ErrorMessage.JSON_PROPERTY_FIELD,
    ErrorMessage.JSON_PROPERTY_MESSAGE
})
@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaClientCodegen", date = "2026-06-25T01:40:22.696269600+09:00[GMT+09:00]", comments = "Generator version: 7.23.0")
public class ErrorMessage {
  public static final String JSON_PROPERTY_SEVERITY = "severity";
  @javax.annotation.Nonnull
  private String severity;

  public static final String JSON_PROPERTY_CODE = "code";
  @javax.annotation.Nullable
  private String code;

  public static final String JSON_PROPERTY_FIELD = "field";
  @javax.annotation.Nullable
  private String field;

  public static final String JSON_PROPERTY_MESSAGE = "message";
  @javax.annotation.Nonnull
  private String message;

  public ErrorMessage() {
  }

  public ErrorMessage severity(@javax.annotation.Nonnull String severity) {
    this.severity = severity;
    return this;
  }

  /**
   * エラーの深刻度
   * 
   * @return severity
   */
  @javax.annotation.Nonnull
  @JsonProperty(value = JSON_PROPERTY_SEVERITY, required = true)
  @JsonInclude(value = JsonInclude.Include.ALWAYS)

  public String getSeverity() {
    return severity;
  }

  @JsonProperty(value = JSON_PROPERTY_SEVERITY, required = true)
  @JsonInclude(value = JsonInclude.Include.ALWAYS)
  public void setSeverity(@javax.annotation.Nonnull String severity) {
    this.severity = severity;
  }

  public ErrorMessage code(@javax.annotation.Nullable String code) {
    this.code = code;
    return this;
  }

  /**
   * エラーコード
   * 
   * @return code
   */
  @javax.annotation.Nullable
  @JsonProperty(value = JSON_PROPERTY_CODE, required = false)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)

  public String getCode() {
    return code;
  }

  @JsonProperty(value = JSON_PROPERTY_CODE, required = false)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)
  public void setCode(@javax.annotation.Nullable String code) {
    this.code = code;
  }

  public ErrorMessage field(@javax.annotation.Nullable String field) {
    this.field = field;
    return this;
  }

  /**
   * 影響を受けるフィールド
   * 
   * @return field
   */
  @javax.annotation.Nullable
  @JsonProperty(value = JSON_PROPERTY_FIELD, required = false)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)

  public String getField() {
    return field;
  }

  @JsonProperty(value = JSON_PROPERTY_FIELD, required = false)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)
  public void setField(@javax.annotation.Nullable String field) {
    this.field = field;
  }

  public ErrorMessage message(@javax.annotation.Nonnull String message) {
    this.message = message;
    return this;
  }

  /**
   * エラーメッセージ
   * 
   * @return message
   */
  @javax.annotation.Nonnull
  @JsonProperty(value = JSON_PROPERTY_MESSAGE, required = true)
  @JsonInclude(value = JsonInclude.Include.ALWAYS)

  public String getMessage() {
    return message;
  }

  @JsonProperty(value = JSON_PROPERTY_MESSAGE, required = true)
  @JsonInclude(value = JsonInclude.Include.ALWAYS)
  public void setMessage(@javax.annotation.Nonnull String message) {
    this.message = message;
  }

  /**
   * Return true if this ErrorMessage object is equal to o.
   */
  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    ErrorMessage errorMessage = (ErrorMessage) o;
    return Objects.equals(this.severity, errorMessage.severity) &&
        Objects.equals(this.code, errorMessage.code) &&
        Objects.equals(this.field, errorMessage.field) &&
        Objects.equals(this.message, errorMessage.message);
  }

  @Override
  public int hashCode() {
    return Objects.hash(severity, code, field, message);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class ErrorMessage {\n");
    sb.append("    severity: ").append(toIndentedString(severity)).append("\n");
    sb.append("    code: ").append(toIndentedString(code)).append("\n");
    sb.append("    field: ").append(toIndentedString(field)).append("\n");
    sb.append("    message: ").append(toIndentedString(message)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    return o == null ? "null" : o.toString().replace("\n", "\n    ");
  }

}
