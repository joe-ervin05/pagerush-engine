import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";

// import { getFont, renderPage, renderTheme } from "../render/core";
import { compileSite } from "../compile/compile";
import { site } from "./site";

const { html, css, js } = await compileSite(site);

const app = new Elysia()
  .use(staticPlugin({ assets: "static", prefix: "/", maxAge: 0 }))
  .get("/runtime.js", async ({ set }) => {
    set.headers["content-type"] = "text/javascript";

    return js;
  })
  .get("/base.css", async ({ set }) => {
    set.headers["content-type"] = "text/css";

    return css;
  })
  .get("/", async ({ set }) => {
    set.headers["content-type"] = "text/html";

    return html;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
