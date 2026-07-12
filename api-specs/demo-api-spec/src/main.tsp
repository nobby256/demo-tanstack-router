import "@typespec/openapi";

import "./pages/detail_page.tsp";
import "./pages/summary_page.tsp";
import "./pages/gentest_page.tsp";
import "./pages/gentest2_page.tsp";
import "./pages/gentest3_page.tsp";

@OpenAPI.info(#{ title: "PG001", version: "1.0.0" })
@service(#{ title: "demo" })
namespace demo;
