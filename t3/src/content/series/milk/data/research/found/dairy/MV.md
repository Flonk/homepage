# Maldives (MV) — dairy
Searched:
- WebSearch "Maldives cuisine dairy products Maldivian milk butter" — yielded the English Wikipedia cuisine article (opened) and trade snippets only (Trading Economics import tables, edition.mv link not opened). No traditional milk or butter use found in snippets.
- WebSearch "Cuisine of the Maldives Wikipedia" — not run; the search budget for this session was exhausted.
- WebSearch "Maldives yoghurt ice cream milk powder dairy imports local production" — not run; the search budget for this session was exhausted.
- WebFetch en.wikipedia.org/wiki/Maldivian_cuisine (first 100,000 characters; the rest of the article was read in a second pass that returned only page navigation) — coconut milk (kaashi kiru) is the only milk-like ingredient named (plant-based, not counted); kandu kukulhu is cooked in coconut milk. No animal milk, butter, ghee, yoghurt, cream, milk sweets, or milk drinks mentioned. Gulha are served with tea; milk in tea not stated.
- WebFetch en.wikipedia.org/wiki/List_of_dairy_products — no entry tied to the Maldives, Dhivehi, or Maldivian people in the first 100,000 characters (remaining 107,018 characters not read).
- WebFetch en.wikipedia.org/wiki/Agriculture_in_the_Maldives — page opened; no mention of livestock, milk, dairy, butter, or ghee. States that most staple foods are imported and agriculture is about 4% of GDP (2012 est.).
- Europe PMC REST search "Maldives dairy milk traditional" — returned 59 hits, all regional or general nutrition/dairy-science reviews with no Maldives-specific dairy content in the titles; no paper was opened, so none is used.
- Not done: the Dhivehi-language search, per-animal searches, the full checklist, government or FAO pages, food-writing searches, and PDF reading. These were blocked by the exhausted web-search budget and were not attempted by other routes.
- Second pass: WebSearch x3 (Maldives dairy/yoghurt/ice cream; Maldivian curd/whey/Dhivehi; Maldives goat milk) — not run; WebSearch budget for the session was exhausted, and no search-engine workaround was used.
- Second pass: WebFetch en.edition.mv / edition.mv/sto/48135 (lead) — opened; article covers Devondale (Australian) butter, mozzarella, cream cheese and sliced cheese sold by STO General Trading. All imported; no local dairy product.
- Second pass: WebFetch en.wikipedia.org/wiki/Maldivian_cuisine, remaining 25,010 characters (offset 100000) — navigation and footer only; no dairy item named.
- Second pass: Europe PMC REST search "Maldives AND (milk OR dairy OR cheese OR butter)", "Maldives AND goat milk", "Maldives AND cattle AND dairy" — opened the result lists; no Maldives-specific dairy paper among the hits (general nutrition, avian influenza, mastitis reviews only). No full text fetched.
- Retry: WebFetch en.wikipedia.org API search "Maldives milk butter yoghurt dairy" (en) — 4 hits (List of Indian dishes, Human food, List of snack foods, Nepal); none Maldivian.
- Retry: WebFetch en.wikipedia.org API search "Maldivian milk" (en) — 20 hits; Maldivian titles are cuisine, kandu kukulhu, rihaakuru, mas riha (all fish or coconut-milk dishes, no animal-milk product).
- Retry: WebFetch en.wikipedia.org/wiki/Cuisine_of_the_Maldives — page does not exist as titled in this run (no dairy content read); en.wikipedia.org/wiki/Maldivian_cuisine re-read, no animal-milk product named.
- Retry: WebFetch en.wikipedia.org/wiki/Maldives, first 100,000 and offset 100000 characters — no livestock, cattle, goat, milk, or dairy mention in the parts read; Economy says agriculture and manufacturing play lesser roles, constrained by limited land and labour. Final 70,733 characters not read.
- Retry: WebFetch Wikidata wbsearchentities "Maldivian dairy" — no results.
- Retry: WebFetch Europe PMC REST search "Maldives AND (fermented milk OR butter OR ghee OR yoghurt OR curd)" — 25 hits; only PMC9740220 (Maldives pediatric nutrition habits, 2022) names the Maldives in its title; not opened for full text, not used as a source for a product.
- Retry: WebFetch dv.wikipedia.org Maldivian cuisine page in Dhivehi — HTTP 404 for the URL tried; not retried.
- Retry: WebFetch tradingeconomics.com Maldives dairy imports — command failed, no output; the lead remains unconfirmed.
- Retry: WebFetch Devondale import article (edition.mv/sto/48135) already opened; Devondale butter entry written up below as an import eaten in the Maldives.

## Devondale butter (imported, Australian; sold in the Maldives)
- Animal(s): cow
- Kind: butter
- What it is: Australian packaged butter sold through Maldivian retail; an imported product, not made in the Maldives.
- How it is made: not stated in the source.
- Where / who: imported and sold in the Maldives by STO General Trading; the article says Devondale products are popular with Maldivians. Home or industrial origin in Australia; no local production.
- Sources: https://en.edition.mv/sto/48135 — confirms Devondale butter is sold in the Maldives and is popular; the source names no local production.
- Unsure: this is an import and was written up under the retry rule for imported products eaten there. It is not a Maldivian product.

## Unconfirmed leads
- Devondale milk (fresh/UHT, Australian import) — named with Devondale butter in the edition.mv lead and described as popular with Maldivians; the opened article covers butter and cheese only, so the milk product is not confirmed by an opened page — https://en.edition.mv/sto/48135 (opened: confirms Devondale butter, mozzarella, cream cheese, sliced cheese; milk not named in the body)
- Maldives dairy imports by country (Australia, UK, Netherlands, Malaysia, Thailand, Indonesia) — seen only in Trading Economics snippets; figures inconsistent and not verified — tradingeconomics.com/maldives/imports/... (not opened; retry fetch failed with no output)
