# Marshall Islands (MH) — dairy
Searched:
- WebSearch "Marshall Islands cuisine dairy coconut milk traditional food": not performed, session web search budget exhausted (200 calls).
- WebSearch "Marshallese food Wikipedia cuisine of the Marshall Islands": not performed, same reason.
- WebSearch "Marshall Islands milk powder canned evaporated milk imports dairy": not performed, same reason.
- WebFetch en.wikipedia.org/wiki/Marshallese_cuisine: opened. No animal milk, butter, cream, yoghurt, cheese-free dairy, milk sweets or any other dairy product named. Only milk-like item is coconut milk (bwiro intro). Chicken, pork and sea turtle named as foods; no animal milk mentioned.
- WebFetch en.wikipedia.org/wiki/Bwiro: 404, page does not exist under that title.
- WebFetch en.wikipedia.org/wiki/Marshallese_cuisine (second prompt, bwiro details): opened. Bwiro is breadfruit paste fermented with coconut milk, wrapped in banana leaves, cooked in an underground oven, keeps for months. Not included as an entry: coconut milk is not milk from an animal, which is the scope for this research.
- Not searched (budget exhausted): Marshallese-language terms, goat/cattle/other animal milk, infant formula, donor milk, dairy imports and industrial products, FAO/government dairy sources, Europe PMC.
- Second pass: WebSearch "Marshall Islands cheese dairy milk traditional food" and "Marshallese food imported canned evaporated milk yoghurt butter" both refused: the session WebSearch budget (200 calls, shared by all agents) is still used up, so no search was run and no page was opened. Not worked around with curl or a proxy. Leads remain unconfirmed; a rerun needs a fresh search budget (CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION raised).
- Retry: WebFetch en.wikipedia.org/w/api.php search "Marshall Islands milk OR butter OR yoghurt OR cream": 20 hits, none about Marshall Islands dairy (UK, US, Dutch, Spanish and other cuisines only).
- Retry: WebFetch mh.wikipedia.org API search "kaan milk" and "milk": 0 hits both times (Marshallese Wikipedia has no milk article reachable by search).
- Retry: WebFetch wikidata wbsearchentities "Marshall Islands dairy": 0 results.
- Retry: WebFetch en.wikipedia.org/wiki/Demographics_of_the_Marshall_Islands: no dairy, cattle, goats, milk or imported food mentioned.
- Retry: WebFetch en.wikipedia.org/wiki/Marshallese_cuisine (third prompt, full keyword sweep): no cream, butter, cheese, yoghurt, cattle, pigs, goats or imported canned milk. Imported foods named are rice, flour, sugar and tea only. Drinks: coconut water and tea.
- Retry: WebFetch en.wikipedia.org/wiki/Economy_of_the_Marshall_Islands: agriculture lists coconuts, tomatoes, melons, taro, breadfruit, fruits, pigs and chickens; the page says the country imports foodstuffs and beverages generally; no dairy.
- Retry: WebFetch en.wikipedia.org/wiki/Agriculture_in_the_Marshall_Islands: 404.
- Retry: WebFetch mh.wikipedia.org/wiki/Majel: 404.
- Retry: WebFetch en.wikipedia.org/w/api.php search "imported canned milk powder OR evaporated milk OR goat OR cattle" with Marshall Islands: no Marshall Islands dairy article among the 20 hits (coconut milk powder, Pacific obesity page, Made in Canada, and others).
- Retry: WebFetch en.wikipedia.org/wiki/Foods_of_Oceania: no milk, dairy or butter for Micronesia or Marshall Islands in the first 100000 characters; sections not reached.
- Retry: WebFetch en.wikipedia.org/wiki/Micronesian_cuisine: 404.
- Retry: WebFetch en.wikipedia.org/wiki/Obesity_in_the_Pacific: Marshall Islands diet as of 2008 described as processed, salty and calorie-dense imported food; canned pork (Spam) mentioned for the Pacific generally; no milk or dairy product named.
- Retry: WebFetch en.wikipedia.org/wiki/Marshall_Islands: history mentions domesticated chickens only as livestock; no pigs, cattle, goats, dairy, milk or imported canned milk in the first 100000 characters.
- Retry: WebFetch mh.wikipedia.org/wiki/Bwiro: 404.
- Retry: result: no entries. Nothing that the opened pages support as a milk product; coconut milk and bwiro excluded as not animal milk.

## Unconfirmed leads
- Imported canned evaporated milk, milk powder and UHT milk in shops — assumed from general knowledge of Pacific Island food imports, not seen in any opened source — no URL
- Marshallese-language names for milk, butter, cream and coconut-based dairy-like drinks — not searched — no URL
- Imported processed foods in the Marshall Islands diet (general, 2008) — seen in en.wikipedia Obesity in the Pacific, which does not name a dairy product — https://en.wikipedia.org/wiki/Obesity_in_the_Pacific
- No entries found — written up with no source; moved back to the leads in the clean-up
