---
title: "Enforcing Architecture through Ceremony"
description: ""
pubDate: "June 18 2025"
---

I don't believe in enforcing architectural decisions through
confluence or diagrams... you have to do it in code.

As in, if you want everyone to use your fancy new validation
class, don't just tell everyone to use it. Nobody will. However,
in your project there's probably that one base class that
everybody inherits from--add your new validator there, so that
people cannot not use it.

Or if people tend to copy-paste boilerplate from existing code,
migrate 2/3rds of existing code to the new fancy thing and it
will catch on. (And don't tell me that this is a code smell,
I've seen all yalls codebases.)

Well, currently I'm working on a fintech project with rather lax
security restrictions compared to your average banking app, but
security is still a core concern.

With my arch hat on, I've defined a list of "auth levels" that
one _must_ supply for each endpoint.

```ts
app.route({
  name: "Frobnication Provider",
  method: "GET",
  route: "frobnication/:id",
  authlevel: "user_with_mfa",
  handler: (request, response) => { ... }
});
```

That means that every dev needs to spend a minute to think about
who is able to access any given endpoint.

But it is very easy to, you know, a few months down the line,
like, just maybe, you want to reuse that endpoint for something
else but you need to drop the MFA requirement so it fits your
usecase. So you change the authlevel to "user".

```ts
app.route({
  name: "Frobnication Provider",
  method: "GET",
  route: "frobnication/:id",
  authlevel: "user",
  handler: (request, response) => { ... }
});
```

That change probably goes unnoticed in a PR. And even if it
doesn't, the dev reviewing the change maybe doesn't realize
that this could be a security issue, because they don't know
the whole picture, and the change makes sense in the context
of the feature that is being implemented.

Of course you could write unit tests checking `authlevel` but
the test is changed just as easily.

What we could do instead in a "security-first" app like ours is to
attach auth levels to controllers instead of endpoints. And we
could even give our controllers super ultra secure names, like
`PublicController`, `DmzController`, `VaultController`.

And suddenly changing an auth level is much more ceremony:
Instead of just changing some string, you need to move an
endpoint definition between files. And I bet you people will
be talking in the PRs and the google chats about whether it's ok
to move some endpoint _out of the vault_ and into the dmz.

Now I'm not saying that this should replace your arch unit tests
or whatever.

But if some method does something important like lock a resource,
then don't hide that complexity behind a decorator. Or like, hide
all the complex parts, _but make the dev actually grab a mutex_
so they know they're doing something important here that needs
extra care.

I call that **architecture through ceremony**.

And it's regular architecture best practice replicated on the
small scale. The reason why your shitty monolith is a big ball
of mud and the other guys' 4 microservices are not, is because
in the monolith you can call any function from anywhere, and in
the microservice landscape that requires a looot of ceremony--the
callee needs to implement an endpoint, update the openapi, and
release a new version.

By adding more friction to certain actions in your monolith,
you can control how it will grow, and define pathways for your
devs that they will naturally adhere to. That way you get a lot
of the benefits of microservices without a lot of the hassle.
