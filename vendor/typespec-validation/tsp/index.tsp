import "../dist/index.mjs";

extern dec decimal(target: unknown, options: DecimalOptions);

model DecimalOptions {
  precision?: int32;
  scale?: int32;
}
