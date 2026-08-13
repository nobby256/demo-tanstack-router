import "@typespec/openapi";

import "./models.tsp";
import "./problem.tsp";

import "./pages/search_page.tsp";
import "./pages/detail_page.tsp";
import "./pages/summary_page.tsp";
import "./pages/gentest_page.tsp";
import "./pages/gentest2_page.tsp";
import "./pages/gentest3_page.tsp";
import "./pages/error-handling_page.tsp";

@OpenAPI.info(#{ title: "service", version: "1.0.0" })
@service(#{ title: "service" })
namespace service;
