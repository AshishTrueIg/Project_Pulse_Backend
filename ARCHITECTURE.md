# Backend architecture

This API follows the same core request pattern used by the 29Black backend:

```text
Route
  → validation/auth middleware
  → controller
  → Service.execute(args, context)
  → BaseHandler.run()
  → response helper
```

## Responsibilities

### Routes

Routes define URLs and compose validation, authentication and authorization.
They do not contain business logic.

### Controllers

Controllers are thin HTTP adapters. A controller:

1. extracts request input;
2. calls one application service through `Service.execute`;
3. sends the result through a shared response helper;
4. forwards errors to the error middleware.

Controllers do not query Sequelize models or implement business rules.

### Services

Each endpoint use case is represented by a class in `src/services`. Endpoint
services extend `BaseHandler` and implement `run()`.

```js
class GetProjectService extends BaseHandler {
  async run () {
    const { projectId } = this.args

    return Project.findByPk(projectId, {
      transaction: this.dbTransaction
    })
  }
}
```

Services receive request-scoped dependencies through `this.context`, including:

- `auth`
- `currentUser`
- `logger`
- `models`
- `request`
- `sequelizeTransaction`
- `traceId`

One service can call another without losing context by using
`this.callHandler(OtherService, args)`.

### BaseHandler

`src/libs/baseHandler.js` provides:

- a consistent `execute()` entry point;
- start/completion/failure logs;
- request trace propagation;
- transaction access;
- unknown error normalization;
- nested service execution with shared context.

### Middleware

`context.middleware.js` creates a context and trace ID for every request.
Authentication enriches that same context with the current user and permission
scope.

### Helpers

Response formatting and refresh-cookie behavior live in `src/helpers`. This
keeps repeated HTTP mechanics out of controllers and business logic.

### Errors

Expected failures use `AppError`. Unknown errors are normalized by
`BaseHandler`, logged centrally and returned through the error middleware in a
stable response shape.

## Module convention

Add each new capability as a vertical module:

```text
src/
  rest-resources/
    controllers/projects.controller.js
    routes/api/v1/projects.routes.js
  services/projects/
    createProject.service.js
    getProject.service.js
    listProjects.service.js
    updateProject.service.js
```

Keep controllers thin even when a use case becomes complex. Split reusable
domain logic into focused helpers or nested handlers rather than moving it into
the controller.
