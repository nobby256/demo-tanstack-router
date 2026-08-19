import "../dist/index.mjs";
import "@typespec/compiler";

using TypeSpec;
using TypeSpec.Reflection;

namespace RhfContract;

/**
 * Marks a model as an RHF form contract.
 *
 * The implementation:
 * - validates that optional leaf properties are not used;
 * - adds RHF-oriented implicit defaults for supported leaf types;
 * - recursively processes anonymous nested models;
 * - does not recursively process named nested models unless they are also
 *   explicitly decorated with `@rhfContract`.
 */
extern dec rhfContract(target: Model);
