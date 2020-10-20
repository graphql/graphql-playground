# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.7.27](https://github.com/graphcool/graphql-playground/compare/graphql-playground-react@1.7.26...graphql-playground-react@1.7.27) (2020-10-20)


### Bug Fixes

* bump codemirror graphql ([#1286](https://github.com/graphcool/graphql-playground/issues/1286)) ([4a4ea29](https://github.com/graphcool/graphql-playground/commit/4a4ea299033b59e14ec130cf85e5ddc11a3698d2))





## [1.7.26](https://github.com/graphcool/graphql-playground/compare/graphql-playground-react@1.7.24...graphql-playground-react@1.7.26) (2020-08-30)

**Note:** Version bump only for package graphql-playground-react





## [1.7.24](https://github.com/graphcool/graphql-playground/compare/graphql-playground-react@1.7.23...graphql-playground-react@1.7.24) (2020-08-30)


### Bug Fixes

* 'addLineBreaks' regex in 'createSDL' to avoid line-breaking comment lines ([#1245](https://github.com/graphcool/graphql-playground/issues/1245)) ([f3b1e03](https://github.com/graphcool/graphql-playground/commit/f3b1e03f887a6dec36301577cdaa7184aff50cce))
* upgrades, schema viewer display & width adjustment ([2bb34bb](https://github.com/graphcool/graphql-playground/commit/2bb34bb8fb8c356e10435727a3f82cd23464b6b6))





## 1.7.23 (2020-06-07)


### Bug Fixes

* 'false' into a non-boolean attribute 'color' ([#1003](https://github.com/graphcool/graphql-playground/issues/1003)) ([1613643](https://github.com/graphcool/graphql-playground/commit/16136437270c1943ff9d7ce57ff58368dcebbc59))
* allow results to fill the entire pane horizontally ([#1142](https://github.com/graphcool/graphql-playground/issues/1142)) ([d418b02](https://github.com/graphcool/graphql-playground/commit/d418b026dc98f008c2af4403b00ac2247078e838))
* Allow scroll in result panel ([#1023](https://github.com/graphcool/graphql-playground/issues/1023)) ([8ee2f40](https://github.com/graphcool/graphql-playground/commit/8ee2f40ce10736c763b4bbc1d3476611e71dff1f))
* graphql-playground -> graphql-playground-react ([#1210](https://github.com/graphcool/graphql-playground/issues/1210)) ([462cfdd](https://github.com/graphcool/graphql-playground/commit/462cfddc11a5c132dbb0bc460614529ff265a247))
* hapi and koa mws for next release ([#1217](https://github.com/graphcool/graphql-playground/issues/1217)) ([40c35fc](https://github.com/graphcool/graphql-playground/commit/40c35fc4c73b939d002c9d2dff51eed5dd0b6aa9))
* not showing deprecated fields on root level ([#995](https://github.com/graphcool/graphql-playground/issues/995)) ([2c33ecb](https://github.com/graphcool/graphql-playground/commit/2c33ecb1935725ad5347b38f61527e25ad9379a9))
* Removed unnecessary } ([#1104](https://github.com/graphcool/graphql-playground/issues/1104)) ([6745aff](https://github.com/graphcool/graphql-playground/commit/6745aff4d945b9c107582a776f2ad5300518fc26))
* schemaGetter props handling ([#1203](https://github.com/graphcool/graphql-playground/issues/1203)) ([d8d655e](https://github.com/graphcool/graphql-playground/commit/d8d655e8ded50034f5f8a83f05069769fc652463))
* workaround for bug in SettingsEditor ([#1198](https://github.com/graphcool/graphql-playground/issues/1198)) ([02fff61](https://github.com/graphcool/graphql-playground/commit/02fff61f7872cc91f2fc026fd925f7af579d9e66))
* X-Apollo-Tracing No Schema Issue ([#1112](https://github.com/graphcool/graphql-playground/issues/1112)) ([1ca035d](https://github.com/graphcool/graphql-playground/commit/1ca035d06f71cbe02aa8f36e7fce2095c2854ba6))
* **deps:** [security] bump handlebars ([ba1fb9d](https://github.com/graphcool/graphql-playground/commit/ba1fb9d56e20806cf759d40abfe4b455993d1d13))
* **deps:** [security] bump lodash in /packages/graphql-playground-react ([27c5368](https://github.com/graphcool/graphql-playground/commit/27c536825d89d112504109205fd2a111ab9c5c40))
* **deps:** [security] bump react-dom ([a79c05e](https://github.com/graphcool/graphql-playground/commit/a79c05e49d937a1319a206c14e394a92a014e1de))
* **deps:** update deps and toolchain, move back to using yarn… ([#1191](https://github.com/graphcool/graphql-playground/issues/1191)) ([824c7a5](https://github.com/graphcool/graphql-playground/commit/824c7a57f0284f022726a8b8840aafc3e8720ccd))
* **graphql-playground-react:** prevent selection of text ([#998](https://github.com/graphcool/graphql-playground/issues/998)) ([4482f5d](https://github.com/graphcool/graphql-playground/commit/4482f5d0faa656ad2b0ea1a54fea9bccb71b619a))
* **graphql-playground-react:** Remove internal scrollbars for subscription results ([#986](https://github.com/graphcool/graphql-playground/issues/986)) ([fc871b6](https://github.com/graphcool/graphql-playground/commit/fc871b6b021a07664f2fd57d91f72693d8af8d3a))


### Features

* run query on variable, header editor through ctrl+enter ([#1141](https://github.com/graphcool/graphql-playground/issues/1141)) ([416694e](https://github.com/graphcool/graphql-playground/commit/416694ed0bdc3c8e4348095b79c8b16e36d6042a))



## 1.8.10 (2019-02-23)



## 1.8.9 (2019-02-01)



## 1.8.8 (2019-01-30)



## 1.8.7 (2019-01-28)


### Bug Fixes

* focus state of sidetabs on button clicks ([#913](https://github.com/graphcool/graphql-playground/issues/913)) ([4c05a53](https://github.com/graphcool/graphql-playground/commit/4c05a53588dfad18bdc129b5a07d2bc02eecb1e5))
* support non primitive types in default value via JSON.strigify ([#914](https://github.com/graphcool/graphql-playground/issues/914)) ([562e1ef](https://github.com/graphcool/graphql-playground/commit/562e1efa23f28450fd13d063e504a2adb00c1a80))



## 1.8.5 (2018-12-10)



## 1.8.4 (2018-11-23)


### Bug Fixes

* do not throw error when server response with empty array errors ([#879](https://github.com/graphcool/graphql-playground/issues/879)) ([874d2ff](https://github.com/graphcool/graphql-playground/commit/874d2ff057fb2879a4f265a46811e08509b955d0))



## 1.6.2 (2018-07-06)



## 1.6.1 (2018-06-26)



# 1.6.0 (2018-05-31)


### Bug Fixes

* empty history. Closes [#643](https://github.com/graphcool/graphql-playground/issues/643) ([84463b8](https://github.com/graphcool/graphql-playground/commit/84463b88ac8d5529bd75240e1230740858c12190))
* new session error. Closes [#701](https://github.com/graphcool/graphql-playground/issues/701) ([5926762](https://github.com/graphcool/graphql-playground/commit/5926762bfba0379f628d62d71c4ab7ce5cf0fea6))
* schema fetching for custom endpoints ([d8a17e8](https://github.com/graphcool/graphql-playground/commit/d8a17e82c0a24d10e1fa7c06b236c3742783825c))



## 1.5.6 (2018-04-24)


### Bug Fixes

* **electron:** update graphql-config-extension-prisma ([8fd45a1](https://github.com/graphcool/graphql-playground/commit/8fd45a1c27172722c335b4c84b793813c2d52b7e))



## 1.5.4 (2018-04-12)


### Bug Fixes

* correctly clearTimeout ([fbb5c1e](https://github.com/graphcool/graphql-playground/commit/fbb5c1ec55250015ef99c2c0dc27394fdf07683c))
* error formatting for json error ([133de56](https://github.com/graphcool/graphql-playground/commit/133de565130ebfc50494a22898abc1d16c48c3d8))
* less aggressive retry ([41ae3fe](https://github.com/graphcool/graphql-playground/commit/41ae3fe4d4590782a2b850d2fae967ade55b8ba8))
* only inject headers to session when injected per url ([66f4a05](https://github.com/graphcool/graphql-playground/commit/66f4a050eece31dc17319eeb22d370785c765fbf))
* prev tab selection ([dbdec7a](https://github.com/graphcool/graphql-playground/commit/dbdec7a0f42a50db4ed5a810cfde7923669754f3))
* schema reloading ([4af733e](https://github.com/graphcool/graphql-playground/commit/4af733ebbc16fc356b09f5e5c209e9b9122e65ef))
* show scrollbar, hide when not hovered (for windows) ([5c79d70](https://github.com/graphcool/graphql-playground/commit/5c79d70fbbed884ad658364e104eb196d1390b4f))
* stop backoff when new starts ([12c41a3](https://github.com/graphcool/graphql-playground/commit/12c41a38a5f166f2cc3baef717d827b3db5d4a62))
* temporarily disable animation until performance problem fixed ([59a39eb](https://github.com/graphcool/graphql-playground/commit/59a39ebbf2f8eb680d64db576d25828db129cf01))



## 1.5.2 (2018-04-02)



## 1.5.1 (2018-04-02)



# 1.5.0 (2018-04-01)



# 1.5.0-rc.5 (2018-03-28)


### Bug Fixes

* **electron:** endpoint injection ([39a1110](https://github.com/graphcool/graphql-playground/commit/39a1110a0284ef05c73ada3892c585c85e6e14a2))



# 1.5.0-rc.2 (2018-03-26)



## 1.4.5 (2018-03-15)


### Bug Fixes

* **cleanup:** Remove platform token, use origin ([2c9c160](https://github.com/graphcool/graphql-playground/commit/2c9c1606445119e7172045da2e4f8f14cfaab26a))
* **deps:** update dependency styled-components to ^3.0.1 ([#526](https://github.com/graphcool/graphql-playground/issues/526)) ([12eb0f3](https://github.com/graphcool/graphql-playground/commit/12eb0f35228b3d24f34fff651434ac8d05c93e9c))
* **link:** Fix 2 regression bugs introduced by switching to Apollo Link ([f0b139e](https://github.com/graphcool/graphql-playground/commit/f0b139ec19bc2269058c6030322074b195b48f7a)), closes [#579](https://github.com/graphcool/graphql-playground/issues/579) [#581](https://github.com/graphcool/graphql-playground/issues/581)
* **props:** Make headers injectable via url ([f01ca8b](https://github.com/graphcool/graphql-playground/commit/f01ca8b767780e2dbf56ccc2bdd23430b192b502))
* **settings:** Expose settings programmatically, update deps ([0356557](https://github.com/graphcool/graphql-playground/commit/03565573869f240675aaa5399bb5f0ac097455c5))


### Features

* migrate to apollo link as a network transport ([46d08f2](https://github.com/graphcool/graphql-playground/commit/46d08f282f8acff961f5b6167e5465069256b559))



## 1.4.2 (2018-01-22)


### Bug Fixes

* **build:** Fix build, temporarily disable yarn workspace, update graphcool-styles & graphcool-ui de ([af501d7](https://github.com/graphcool/graphql-playground/commit/af501d7a754a14dbacc76439a77434f892828482))
* **curl:** Fixed curl command generation ([0eb2492](https://github.com/graphcool/graphql-playground/commit/0eb2492545d8c58de80eb8e435840e3fadc144b2)), closes [#333](https://github.com/graphcool/graphql-playground/issues/333)
* **graphql-playground-react:** Fix variable editor ([90af813](https://github.com/graphcool/graphql-playground/commit/90af8135be85b7088799c17e4f0b2994dcf2abb5)), closes [#372](https://github.com/graphcool/graphql-playground/issues/372)
* **graphql-playground-react:** Replaced triangle Icon component with React SVG component ([0ef92d0](https://github.com/graphcool/graphql-playground/commit/0ef92d02e10493726a368de5000589bd6e1a0d28))
* **graphql-playground-react:** Selected tab index is now properly persisted ([802b62e](https://github.com/graphcool/graphql-playground/commit/802b62e53a457ed10db5e39b3f7f7d4aa211d0bb))
* **GraphQLEditor:** init state.isReloadingSchema to false ([b59c6e6](https://github.com/graphcool/graphql-playground/commit/b59c6e65725540ef19ded88e677070ab0f8db945))
* **PlaygroundStorage:** Fix deserialization defaullt ([6766bb0](https://github.com/graphcool/graphql-playground/commit/6766bb001d98d4f131ac71c9bb07804891a7d287))
* **react:** fix subscription payload ([b432655](https://github.com/graphcool/graphql-playground/commit/b4326555c84d90b96e10bad5cf5a0c826b4e500f))
* **subscription:** fix subscription url handling ([e8a7d42](https://github.com/graphcool/graphql-playground/commit/e8a7d42d4a4458b6f0d0e27b7e31a5386ff50be8))
* **subscriptions:** Fixed subscriptions ([8dc1769](https://github.com/graphcool/graphql-playground/commit/8dc17691734362853f2fd84c6bd56530f2ce7329))
* **subscriptions:** fixed subscriptions url normalization ([f675517](https://github.com/graphcool/graphql-playground/commit/f67551718fb93d9170ca393e996e588a8fa834c8))
* **subscriptions:** update subscriptions-transport-ws + update api calls ([e187c47](https://github.com/graphcool/graphql-playground/commit/e187c470a97a7ea6c03ce1ed6097eae2855fa251))
* react app subscription handling ([362abf5](https://github.com/graphcool/graphql-playground/commit/362abf5a401bf73e377f941c52578ed78523d625))


### Features

* **graphql-playground-react:** added spinner for schema fetching ([24072cb](https://github.com/graphcool/graphql-playground/commit/24072cbd1d332fff402c4a829cfa25784f982f32))
* **TopBar:** animate the icon when reloading schema ([9a4cb0a](https://github.com/graphcool/graphql-playground/commit/9a4cb0a587cae09cdfbe8781eef8ad3f92fbc3cd))
* **TopBar:** notify the user when reloading the schema fails ([4df1da3](https://github.com/graphcool/graphql-playground/commit/4df1da30e6cbbc23510fbb6c36928e9e28cf3f08))


### Reverts

* Revert "style(TopBar): fade in/out the error message if the endpoint is unreachable" ([000946f](https://github.com/graphcool/graphql-playground/commit/000946fd2f334e5c46f1157731c5073010043281))
