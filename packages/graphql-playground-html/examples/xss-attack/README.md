# GraphQL Playground HTML XSS Reflection Attack Example

This shows the simplest possible example for how one might re-create the XSS Reflection Vulnerability reported by Cure53.

Notice we force the resolution to `graphql-playground-html@1.6.20`, which is the last version susceptible. All prior versions are susceptible to the attack.

Dynamic, unsanitized input that resembles some of the configuration you see is a simple example - if url parameters, query parameters, unsanitized database text strings, etc are passed to `expressPlayground()`, `renderPlaygroundPage()` or equivalent middleware functions such as `koaPlayground()`, they are all vulnerable to this attack.

## Reccomendations

Here we use `xss` because it was easy to provide for node.js, however [DOMPurify](https://github.com/cure53/DOMPurify) is also an excellent choice for sanitizing strings for unwanted html. By default it requires the browser DOM, but you can load it with JSDOM for server side purposes as well.

here are a few more tips to prevent other XSS vulnerabilities that might exist in your own applications:

- `DOMPurify.sanitize` url values with user input to be used for rendering `<a href=` or `<script src=`, `<img src=` etc. whether using react or not!
- in react,`dangerouslySetInnerHtml={{ __html: { DOMPurify.sanitize(userInputString) }}` always!
- when doing direct dom manipulation, avoid `domElement.innerHTML = string` at all costs, but at least `DOMPurify.sanitize(string)` first if you must
- when generating an entire html file, sanitize *all* user input values (this was our mistake)

## Setup

```sh
$ yarn
$ yarn start
```

## Examples

Now that you've set up the example, you can view the examples:

### Example 1 - Query params

this one uses query parameters

http://localhost:4000/example-1?id=%3C/script%3E%3Cscript%3Ealert('I%20%3C3%20GraphQL.%20Hack%20the%20Planet!!')%3C/script%3E%3Cscript%3E

### Example 2 - DB Example

this one uses a mock database, to demonstrate more ways in which the function is susceptible

http://localhost:4000/example-2

### Example 3 - Upgrade workaround example

this one uses query like number 1, but shows how to use [`xss`](https://npmjs.com/xss) module to workaround the issue if you aren't able to upgrade

http://localhost:4000/example-3?id=%3C/script%3E%3Cscript%3Ealert('I%20%3C3%20GraphQL.%20Hack%20the%20Planet!!')%3C/script%3E%3Cscript%3E

### Example 4 - Always Safe example

this one uses static values, so it's safe without any workarounds! (try removing the ?darkMode parameter)

http://localhost:4000/example-4?darkMode=%3C/script%3E%3Cscript%3Ealert('I%20%3C3%20GraphQL.%20Hack%20the%20Planet!!')%3C/script%3E%3Cscript%3E

[XSS Safe using static configuration strings]("http://localhost:4000/example-3?darkMode")

## More Details

See more details in [SECURITY.md](../../../../SECURITY.md)
