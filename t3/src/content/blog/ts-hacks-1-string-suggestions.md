---
title: "Typescript Hacks #1: String suggestions"
description: ""
pubDate: "Sep 5, 2023"
---

Append `string & {}` to your string unions, and you have a type that allows any string, but autocomplete will also show you some values as suggestions.

![String Suggestions](/assets/ts-hacks-1-string-suggestions/1_lMIIJSrcW1BOOFTxU0tkIw.webp)

## How does it work?

If you have a type like `type Fruit = "apple" | "pear" | string`, the typescript compiler will simplify the type to just `string`, and no autocomplete suggestions will be given.
