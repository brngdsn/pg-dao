PostgresDAO (pg-dao)
====

A simple DAO for Postgres `Pool`, with a generic CRUD interface.

e.g.,

```
// Retrieve the `users` relation
const users = await dao.read('users')
```
