## GraphQL Playground introspection schema template injection attack: Advisory Statement

This is a security advisory for an XSS vulnerability in `graphql-playground`.

A similar vulnerability affects `graphiql`, the package from which `graphql-playground` was forked. There is a corresponding `graphiql` [advisory](https://github.com/graphql/graphiql/security/advisories/GHSA-x4r7-m2q9-69c8).

- [1. Impact](#1-impact)
- [2. Scope](#2-scope)
- [3. Patches](#3-patches)
- [4. Reproducing the exploit](#4-reproducing-the-exploit)
- [5. Credit](#5-credit)
- [6. For more information](#6-for-more-information)

### 1. Impact

All versions of `graphql-playground-react` older than `graphql-playground-react@1.7.28` are vulnerable to compromised HTTP schema introspection responses or `schema` prop values with malicious GraphQL type names, exposing a dynamic XSS attack surface that can allow code injection on operation autocomplete.

In order for the attack to take place, the user must load a malicious schema in `graphql-playground`. There are several ways this can occur, including by specifying the URL to a malicious schema in the `endpoint` query parameter. If a user clicks on a link to a GraphQL Playground installation that specifies a malicious server, arbitrary JavaScript can run in the user's browser, which can be used to exfiltrate user credentials or other harmful goals.

### 2. Scope

This advisory describes the impact on the `graphql-playground-react` package. The vulnerability also affects `graphiql`, the package from which `graphql-playground` was forked, with a less severe impact; see the [`graphiql` advisory](https://github.com/graphql/graphiql/security/advisories/GHSA-x4r7-m2q9-69c8) for details. It affects all versions of `graphql-playground-react` older than `v1.7.28`.

This vulnerability was introduced with the first public release of `graphql-playground`, so it impacts both the original legacy `graphql-playground` and the contemporary `graphql-playground-react` npm package. It is most easily exploited on `graphql-playground-react@1.7.0` and newer, as that release added functionality which made it possible to override the endpoint URL via query parameter even if it is explicitly specified in the code.

`graphql-playground-react` is commonly loaded via the `graphql-playground-html` package or a middleware package that wraps it (`graphql-playground-express`, `graphql-playground-middleware-koa`, `graphql-playground-middleware-hapi`, or `graphql-playground-middleware-lambda`). By default, these packages render an HTML page which loads the *latest* version of `graphql-playground-react` through a CDN. If you are using one of these packages to install GraphQL Playground on your domain *and you do not explicitly pass the `version` option to `renderPlaygroundPage` or the middleware function*, then you do not need to take any action to resolve this vulnerability, as the latest version of the React app will automatically be loaded.

`graphql-playground-react` is also commonly loaded via HTML served by Apollo Server. Apollo Server always pins a specific version of `graphql-playground-react`, so if you are using Apollo Server you do need to take action to resolve this vulnerability. See the [Apollo Server advisory](https://github.com/apollographql/apollo-server/security/advisories/GHSA-qm7x-rc44-rrqw) for details.


### 3. Patches

`graphql-playground-react@1.7.28` addresses this issue via defense in depth:

- **HTML-escaping text** that should be treated as text rather than HTML. In most of the app, this happens automatically because React escapes all interpolated text by default. However, one vulnerable component uses the unsafe `innerHTML` API and interpolated type names directly into HTML. We now properly escape that type name, which fixes the known vulnerability.

- **Validates the schema** upon receiving the introspection response or schema changes. Schemas with names that violate the GraphQL spec will no longer be loaded. (This includes preventing the Doc Explorer from loading.) This change is also sufficient to fix the known vulnerability.

- **Ensuring that user-generated HTML is safe**. Schemas can contain Markdown in `description` and `deprecationReason` fields, and the web app renders them to HTML using the `markdown-it` library. Prior to `graphql-playground-react@1.7.28`, GraphQL Playground used two separate libraries to render Markdown: `markdown-it` and `marked`. As part of the development of `graphql-playground-react@1.7.28`, we verified that our use of `markdown-it` prevents the inclusion of arbitrary HTML. We use `markdown-it` without setting `html: true`, so we are comfortable relying on [`markdown-it`'s HTML escaping](https://github.com/markdown-it/markdown-it/blob/master/docs/security.md) here. We considered running a second level of sanitization over all rendered Markdown using a library such as `dompurify` but believe that is unnecessary as `markdown-it`'s sanitization appears to be adequate. `graphiql@1.4.3` does update to the latest version of `markdown-it` (v12, from v10) so that any security fixes in v11 and v12 will take effect. On the other hand, [`marked`](https://github.com/markedjs/marked) recommends the use of a separate HTML sanitizer if its input is untrusted. In this release, we switch the one component which uses `marked` to use `markdown-it` like the rest of the app.

**If you are using `graphql-playground-react` directly in your client app**, upgrade to version 1.7.28 or later.

**If you are using `graphql-playground-html` or a package which starts with `graphql-playground-middleware-` in your server** and you are passing the `version` option to a function imported from that package, change that `version` option to be at least `"1.7.28"`.

**If you are using `graphql-playground-html` or a package which starts with `graphql-playground-middleware-` in your server** and you are **NOT** passing the `version` option to a function imported from that package, no action is necessary; your app automatically loads the latest version of `graphql-playground-react` from CDN.


### 4. Reproducing the exploit

We are hosting a "malicious" server at https://graphql-xss-schema.netlify.app/graphql . This server has a hard-coded introspection result that includes unsafe HTML in type names.

If you manually change a GraphQL Playground installation to use that endpoint, clear the operation pane, and type `{x` into the operation pane, an alert will pop up; this demonstrates execution of code provided by the malicious server.

An URL like https://YOUR-PLAYGROUND-SERVER/?endpoint=https%3A%2F%2Fgraphql-xss-schema.netlify.app%2Fgraphql&query=%7B will load already configured with the endpoint in question. (This URL-based exploit works on `graphql-playground-react@1.7.0` and newer; older versions may be protected from this particular URL-based exploit depending on their configuration.)
### 5. Credit

This vulnerability was discovered by [@Ry0taK](https://github.com/Ry0taK), thank you! :1st_place_medal:

Others who contributed:

- extensive help from [@glasser](https://github.com/glasser) at [Apollo](https://github.com/apollographql)
- [@acao](https://github.com/acao)
- [@imolorhe](https://github.com/imolorhe)
- [@divyenduz](https://github.com/divyenduz)
- [@dotansimha](https://github.com/dotansimha)
- [@timsuchanek](http://github.com/timsuchanek)
- [@benjie](https://github.com/Ry0taK) and many others who provided morale support

### 6. For more information

If you have any questions or comments about this advisory:

- The `graphiql` advisory document contains [more information](https://github.com/graphql/graphiql/blob/main/docs/security/2021-introspection-schema-xss.md#2-more-details-on-the-vulnerability) about how both the client-side and server-side vulnerabilities work
- Open an issue in the [graphql-playground repo](https://github.com/graphql/graphql-playground/new/issues)
