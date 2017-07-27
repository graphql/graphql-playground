## Playground

```sh
$ yarn install
$ yarn start
```

### Middleware

#### Usage
```javascript
import express from 'express';
import { express as middleware } from 'graphql-playground/middleware';

const app = express();

app.use('/playground', middleware({ endpointUrl: '/graphql' }));

app.listen(3000);
```
