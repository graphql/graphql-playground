# GraphQL Playground HTML XSS Exploit Example

This shows the simplest possible example for how one might re-create the XSS Vulnerability reported by Cure53.

Notice we force the resolution to `graphql-playground-html@1.6.20`, which is the last version susceptible. All prior versions are susceptible to the attack.

Dynamic, unsanitized input that resembles some of the configuration you see is a simple example - if url parameters, query parameters or unsanitized database text strings are passed to `expressPlayground()`, `renderPlaygroundPage()` or equivalent middleware functions such as `koaPlayground()` etc, they are all vulnerable to this attack depending on how configuration is supplied

## Setup

```sh
$ yarn
$ yarn start
```

## Examples

Now that you've set up the example, you can view the exploits:

### Example 1 - Query params

this one uses query parameters

http://localhost:4000/example-1?id=%3C/script%3E%3Cscript%3Ealert('I%20%3C3%20GraphQL.%20Hack%20the%20Planet!!')%3C/script%3E%3Cscript%3E

### Example 2 - DB Example

this one uses a mock database, to demonstrate more ways in which the function is susceptible

http://localhost:4000/example-2

### Example 3 - Workaround example

this one uses query like number 1, but shows how to use [`xss`](https://npmjs.com/xss) module to workaround the issue if you aren't able to upgrade

http://localhost:4000/example-3?id=%3C/script%3E%3Cscript%3Ealert('I%20%3C3%20GraphQL.%20Hack%20the%20Planet!!')%3C/script%3E%3Cscript%3E

### Example 4 - Safe example

this one uses static values, so it's safe without any workarounds! (try removing the ?darkMode parameter)

[XSS Safe using static configuration strings]("http://localhost:4000/example-3?darkMode")

## More Details

See more details in [SECURITY.md](../../../../SECURITY.md)
