---
title: "Free constructions #2 - Monoids & Lists"
description: ""
pubDate: "June 19 2025"
---

This is part 2 of a series on free constructions.
[You can find part 1 here](../free-constructions-1).

Not all monoids are commutative. Take string concatenation for
example.

```ts
"Hello" + " World"; // "Hello World"
"World" + " Hello"; // "World Hello"
```

Clearly not the same.

But, string concatenation is still associatve:

```ts
("a" + "b"\) + "c"; // "abc"
"a" + ("b" + "c"); // "abc"
```

And also we have an identity element, the empty string `""`.

```ts
"a" + ""; // "a"
"" + "a"; // "a"
```

Hence, string concatenation is a **monoid**. Just not a
commutative one.

Dropping the commutativity requirement, we can no longer store
complex expressions like `a + b + c` in a multiset, because
the order of the elements suddenly matters. To see that, lets
try to construct a multiset for the expression
`"a" + "a" + "b" + "c" + "a"`, like we did last post.

```ts
// multiset.ts

const expression = merge(
  merge(lift("a"), lift("a")),
  merge(lift("b"), merge(lift("c"), lift("a")))
);

const result = evaluate(expression, (a, b) => a + b); // "aaabc"
```

---

Clearly that's not the right result, which should be `"aabca"`;
this is because multisets don't keep track of which order the
elements were added in.

So, multisets don't cut it anymore. We need a new data
structure that can store expressions for non-commutative
monoids.

## Lists

For monoids, that datastructure is the plain old **list**.

Lists behave a lot like multisets, in the sense that they count
how often any given element has been added to them; but they also
have a notion of order!

Our string concatenation problem can be expressed as a list like
so:

```ts
const expression = ["a", "a", "b", "c", "a"];
```

And of course we also have an `evaluate` function that takes a
list and reconstructs the result of the expression. I'm sure you
can guess how it is implemented:

```ts
type BinaryOperation<T> = (a: T, b: T) => T;
const evaluate = <T>(list: T[], op: BinaryOperation<T>, initial: T): T => {
  return list.reduce((acc, value) => op(acc, value));
};

const result = evaluate(expression, (a, b) => a + b, ""); // "aabca"
```

That's right, it's just `.reduce`.

And just like with multisets, we can also define a
`merge` operation for lists, which concatenates two lists, making
_lists themselves a monoid_.

```ts
const merge = <T>(a: T[], b: T[]): T[] => {
  return [...a, ...b];
};
```

For good measure, let's rephrase our string concatenation problem
using purely lists:

```ts
const lift = <T>(value: T): T[] => [value];

const expression = merge(
  merge(lift("a"), lift("a")),
  merge(lift("b"), merge(lift("c"), lift("a")))
);

const result = evaluate(expression, (a, b) => a + b, ""); // "aabca"
```

Cool! We have restored order.

## Exercises

1. Go ahead an convince yourself that `expression` and our
   original concatenation problem are equivalent. To do that,
   just replace each call to `merge` with `+`, and `lift` with
   nothing.

2. Convince yourself that the `merge` operation is associative.
   Do that by taking some multisets `a`, `b`, and `c`, and
   showing that `merge(merge(a, b), c)` is the same as
   `merge(a, merge(b, c))`.

3. Convince yourself that the `merge` operation is **not**
   commutative. Do that by taking some multisets `a` and `b`, and
   showing that `merge(a, b)` is not the same as `merge(b, a)`.

## Final thoughts

Of course, all the findings from the previous post still apply:
We have decoupled data from evaluation, and we have found the
mother-of-all-monoids, the list, in the sense that given a list,
we can "move" into any monoid by calling `evaluate` with the
appropriate operation, but that wouldn't be possible the other
way around.

As in, given the result `"aabca"`, we don't know whether it
came from `"aa" + "bca"` or `"a" + "a" + "b" + "c" + "a"`;
information was lost while computing the result. Lists on the
other hand preserve the information about how the
elements were added, so we can reconstruct the original
expression.

This makes lists the **free monoid** on type `T`.

Free monoids are a common topic in category theory and haskell circles,
and some of you might have come across the term before.

In particluar I'd like to shout out [Bartosz Milewski's excellent
"Categories for Programmers"](https://bartoszmilewski.com/2015/07/21/free-monoids/)
where he also discusses free monoids, albeit in a more technical
way.

In the next post we'll take a look at **free magmas**, before
tying it all together in a theoretical framework.

Stay tuned!
