---
title: "prefixed/compound ids are kinda neat"
description: ""
pubDate: "May 07 2025"
---

I mean I am aware of hungarian notation. And the Win32 API disaster, featuring ridiculous names like `lpszFoo` referring to a "long pointer to zero-terminated string Foo", even though `lpszFoo` is likely not even a "long pointer" anymore because this is not the 1990s. But they can't ever change the name for backwards compatibility reasons.

So hungarian notation is probably not right for every use case.
dns2.p09.nsone.net
But, right now I'm working on a project where we added type information to our database entities' ids instead of using just raw uuids. And hey, it's kinda nice!

We have.. users, for example `usr-12345`.
Or there's resources, in a green and in a blue variety: `rg-10fb48bf-473a-41e3-aee6-e8d7b376246b`, `rb-599a828a-1f2c-4c5f-93c1-687de5ecded6`.

Users may have multiple addresses, so we've prepended the user id to the address id! `addr-12345-01`.

I mean. Having completely random uuids for everything is probably the most flexible and the most resistant to change. But I have to say, working with ids that contain information has been so helpful when having to look stuff up in our database, or when `console.log`ging during development, or when providing debug information in production.

Or, we have a little script where you can shove any id in and it will do the correct database lookups and render a summary for you. Since ids are typed, you can tell which table you have to query simply from the id's prefix. Super handy.

Typescript has had [template literal types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) for quite a while now, and we can use that to even encode that information in the type system.

```typescript
type ResourceGreenId = `rg-${string}`;
type ResourceBlueId = `rb-${string}`;
type ResourceId = ResourceGreenId | ResourceBlueId;
type AddressId = `addr-${string}-${string}`;
```

idk. Maybe this is super obvious to everyone else and I'm just late to the party, or maybe I haven't found out yet why this is a bad idea, but I will probably do that in all future projects from now on.
