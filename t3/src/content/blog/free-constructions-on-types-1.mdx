---
title: "Free constructions #1 - Commutative Monoids & Multisets"
description: ""
pubDate: "June 07 2025"
---

Let's take a binary operation that is _associative_ and
_commutative_, like addition on numbers.

In case you forgot, addition is associative because you can swap
brackets around or leave them out altoghether without changing
the result, like $ (2 + 4) + 3 = 2 + (4 + 3) = 2 + 4 + 3 = 9 $.
And it is commutative because you can swap the order of the
numbers too, like $ 2 + 4 = 4 + 2 $.

Let's also remember that these operations have a special
value called the **identity element** or **unit**, that doesn't
change the result when you plug it into your operation. For addition,
the identity element is $0$, because $ n + 0 = n $, and for 
multiplication, the identity element is $1$, because
$ n \cdot 1 = n $.

We call this -- a binary, associative, commutative, and unital operation
like addition, on some set like numbers -- a **commutative
monoid** by the way. Addition on numbers $(\mathbb{R}, +)$
is a commutative monoid for example, multiplication on numbers
$(\mathbb{R}, \cdot)$ is another example. Or, so is $(\lbrace
true, false \rbrace, \land)$, the commutative monoid of boolean
values with the logical AND operation. Try it!

Now, say that instead of just calculating the result, we would
like to keep track of what numbers were added together, so that
we can reconstruct the result later.

For associative and commutative operations, the "smallest"
possible datatype that can store that information is a
**multiset**, which is like a regular set, but allows for
multiple occurrences of the same element.

For example, the addition expression
$ 1 + 1 + 1 + 2 + 3 + 4 + 4 $ could be represented, in (almost)
typescript, like so:

```ts
type Multiset<T> = Map<T, number>;

const multiset: Multiset<number> = new Map([
  [1, 3],
  [2, 1],
  [3, 1],
  [4, 2],
]);
```

That is, three ones, one two, one three, and two fours.

And we can then reconstruct the addition expression by iterating
over the multiset and adding the numbers together, like so:

```ts
type BinaryOperation<T> = (a: T, b: T) => T;
const add: BinaryOperation<number> = (a, b) => a + b;

const evaluate = <T>(
  multiset: Multiset<T>,
  operation: BinaryOperation<T>,
  initial: T
): T => {
  let result = initial;

  for (const [value, count] of multiset.entries()) {
    for (let i = 0; i < count; i++) {
      result = operation(result, value);
    }
  }

  return result;
};

const result = evaluate(multiset, add, 0); // 16
```

I've also introduced a type `BinaryOperation<T>` and
abstracted the addition away, since technically the multiset
doesn't store any information about the operation we use to
evaluate it. The multiset for the expression
$ 1 \cdot 1 \cdot 1 \cdot 2 \cdot 3 \cdot 4 \cdot 4 $ would
look exactly the same, and we could use the same `evaluate`
function and pass `(a, b) => a * b` as the operation to get the
result (96).

That makes the multiset rather special! Like, given just the
result of the addition (16), there would be no way to reconstruct
the result of the multiplication (96) from it, because solving
the addition problem destroyed information about the numbers
that went in, in a way that the multiset does not.

And in a way the multiset doesn't evaluate anything, it just
keeps track of what is supposed to happen.

Not only that, we can also _define a binary operation on
multisets themselves_ that is both associative and commutative.
Look at this:

```ts
const merge = <T>(a: Multiset<T>, b: Multiset<T>): Multiset<T> => {
  const result = new Map<T, number>(a);

  for (const [value, count] of b.entries()) {
    result.set(value, (result.get(value) ?? 0) + count);
  }

  return result;
};
```

And ok, I will only do this once, but lets take our original
addition problem $ 1 + 1 + 1 + 2 + 3 + 4 + 4 $ again and move it
into the realm of multisets:

```ts
// helper function to not go insane
const lift = <T>(value: T): Multiset<T> => new Map([[value, 1]]);

const expression = merge(
  merge(
    merge(merge(lift(1), lift(1)), merge(lift(1), lift(2))),
    merge(lift(3), merge(lift(4), lift(4)))
  )
);

const result = evaluate(expression, add); // 16
```

I've nested the merge calls rather arbitrarily, but that's okay
since our operation is associative, meaning bracketing doesn't
matter!

## Exercises

1. Go ahead an convince yourself that `expression` and our
   original addition problem are equivalent. To do that, just replace
   each call to `merge` with `+`, and `lift` with nothing I guess.

2. Convince yourself that the `merge` operation is associative.
   Do that by taking some multisets `a`, `b`, and `c`, and
   showing that `merge(merge(a, b), c)` is the same as
   `merge(a, merge(b, c))`.

3. Convince yourself that the `merge` operation is commutative.
   Do that by taking some multisets `a` and `b`, and
   showing that `merge(a, b)` is the same as `merge(b, a)`.

## Final thoughts

There's three things I'd like you to take away from this:

- We have found a way to decouple data from evaluation. We've
  stated the addition problem in a way that just stores all the
  data, but does not compute anything until we call `evaluate`.
- The multiset is like the mother-of-all-commutative monoids.
  Given a multiset, we can "move" into the addition commutative
  monoid just by calling `evaluate` with the addition
  operation. And we can move into the multiplication commutative
  monoid by calling `evaluate` with the multiplication
  operation. We can't move from the addition commutative
  monoid to the multiplication commutative monoid this
  way, i.e. we can't reconstruct 96 from 16.

And most importantly.

Not all types have well-known commutative monoids, like
numbers have addition or multiplication. You can't add two
objects of type `DatabaseRepository` or `DogApple`, generally
speaking. **But, given any type `T`, we always know there is at
least one commutative monoid: `Multiset<T>`**.

This is why we call `Multiset<T>` the **free commutative
monoid** on type `T`.

We get it for free so to speak, it just always exists.
