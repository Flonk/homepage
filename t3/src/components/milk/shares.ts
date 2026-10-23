import * as S from './schema';

/**
 * How much of the world's milk goes each way, as the mass made of each
 * product in million tonnes a year, and how that was worked out: estimates, against the
 * world's 964 Mt of 2023 (all animals; IDF). Products made together by one
 * step share its milk by weight: the cream about a tenth of the milk
 * separated, the curd about an eighth of the milk set with rennet, the
 * cheese's own weight and a little whey. What is left, about 175 Mt, is
 * drunk raw or boiled, or fed to calves, and goes nowhere in the tree.
 *
 * Sources (each share links to its own, below):
 * - IDF, The World Dairy Situation 2024: milk, cheese, butter and powder
 *   output in 2023; cow's milk delivered to dairies 59%.
 *   https://www.milksa.co.za/sites/default/files/2024-12/2024%20World%20Dairy%20Situation%20Report.pdf
 * - India, where milk goes: about 20% to co-operatives and private dairies,
 *   32% sold loose, 48% kept at home (Dept. of Animal Husbandry and
 *   Dairying, FY19, via CARE Ratings); liquid milk about 46%, ghee and
 *   butter about a third, khoa, paneer and dahi most of the rest.
 *   https://www.careratings.com/upload/NewsFiles/SplAnalysis/Indian%20Dairy%20%20Dairy%20Products%20Industry%20-%20June%202020.pdf
 *   https://epgp.inflibnet.ac.in/epgpdata/uploads/epgp_content/S000015FT/P000357/M002906/ET/1462433257P-7_1ET.pdf
 * - FAO: over 80% of the milk marketed in developing countries is handled
 *   informally, most of it boiled at home.
 *   https://www.fao.org/dairy-production-products/socio-economics/markets-and-trade/en
 * - Cream for direct consumption by country, 2023 (Eurostat apro_mk_cola,
 *   via Reportlinker): Germany 522 kt, France 470, the UK 315, Belgium 270,
 *   Poland 265, Italy 152, Spain 137.
 *   https://www.allthatstats.com/en/statistics/apro_mk_cola/cows-milk-collection-and-products-obtained-annual-data/?page=2
 * - Camel milk, about 4 Mt in 2022 (FAOSTAT, via DairyNews).
 *   https://dairynews.today/news/camel_milk_industry_expands_with_increased_global_demand_6003217.html
 */
export const WORLD_MILK = 964;
export const IDF = { name: 'IDF, The World Dairy Situation 2024', url: 'https://www.milksa.co.za/sites/default/files/2024-12/2024%20World%20Dairy%20Situation%20Report.pdf' };
export const INDIA = { name: 'CARE Ratings, Indian dairy industry (2020)', url: 'https://www.careratings.com/upload/NewsFiles/SplAnalysis/Indian%20Dairy%20%20Dairy%20Products%20Industry%20-%20June%202020.pdf' };
export const INDIA_USE = { name: 'e-PG Pathshala, milk utilisation pattern in India', url: 'https://epgp.inflibnet.ac.in/epgpdata/uploads/epgp_content/S000015FT/P000357/M002906/ET/1462433257P-7_1ET.pdf' };
export const FAO_INFORMAL = { name: 'FAO, Dairy production and products: markets and trade', url: 'https://www.fao.org/dairy-production-products/socio-economics/markets-and-trade/en' };
export const CAMEL = { name: 'DairyNews, camel milk production 2022 (FAOSTAT)', url: 'https://dairynews.today/news/camel_milk_industry_expands_with_increased_global_demand_6003217.html' };
export const EU_CREAM = { name: 'Eurostat apro_mk_cola, cream for direct consumption (via allthatstats)', url: 'https://www.allthatstats.com/en/statistics/apro_mk_cola/cows-milk-collection-and-products-obtained-annual-data/?page=2' };
export const SHARES: Record<string, S.Share> = {
	homogenised: { mt: 357, sources: { links: [IDF, INDIA, INDIA_USE, FAO_INFORMAL], text: 'All made from whole milk: packaged milk, yoghurt and dahi, whole milk powder, khoa, paneer, and the ghee churned from dahi at home. What is left once the rest is counted.' } },
	rawCream: { mt: 24, sources: { links: [IDF, EU_CREAM], text: 'An eighth by weight of the 193 Mt separated: the cream for about 8.5 Mt of butter and ghee made outside the home (of 13.2 Mt of butter and milk fat in 2023, half of it in India), at about 2 kg of cream a kilo, and about 5.5 Mt sold as cream.' } },
	cream: { mt: 18.5, sources: { links: [IDF, EU_CREAM], text: 'Raw cream not sold as cream: churned into butter and ghee, and made into ice cream, cream cheese and the rest.' } },
	creamGrades: { mt: 5.5, sources: { links: [EU_CREAM], text: 'Cream sold as it is, for coffee, cooking and whipping: about 2.5 Mt in the EU (Germany 0.52, France 0.47, Belgium 0.27, Poland 0.26), 0.3 Mt in the UK, and as much again elsewhere.' } },
	skimRaw: { mt: 169, sources: { links: [IDF], text: 'The rest of the 193 Mt separated: semi-skimmed and skimmed milk, skim milk powder, quark and casein.' } },
	cheese: { mt: 25, sources: { links: [IDF], text: 'About 26 Mt of natural cheese in 2023 (23.8 Mt of it from cows’ milk, 90% of all), less the fresh cheese set with acid: the curd, pressed and salted, a little lighter than it went in.' } },
	rennetCurd: { mt: 26, sources: { links: [IDF], text: 'About 26 Mt of natural cheese (23.8 Mt of it from cows’ milk in 2023) from about 222 Mt of milk, at about 9 kg of milk a kilo: the curd weighs about what the cheese does.' } },
	sweetWhey: { mt: 196, sources: { links: [IDF], text: 'The rest of the 222 Mt of cheese milk; most of the world’s whey comes from cheese.' } },
	tonedMilk: { mt: 14, sources: { links: [INDIA, INDIA_USE], text: 'Much of India’s packaged milk: its dairies handle about a fifth of its 239 Mt, about two thirds of that sold as milk, toned or double-toned the most of it.' } },
	thermised: { mt: 1, sources: { unsourced: true, text: 'Little is sold as it is: milk thermised to be kept until it is made into cheese is counted with the cheese. My own rough estimate.' } },
	certified: { mt: 0.1, sources: { unsourced: true, text: 'Raw milk sold under licence from a few farms, such as Germany’s Vorzugsmilch. My own rough estimate.' } },
	lacticCheese: { mt: 1.2, sources: { unsourced: true, text: 'Mostly French goat’s cheeses: a few hundred thousand tonnes of cheese, at about 6 kg of milk a kilo. My own rough estimate.' } },
	choormog: { mt: 1.4, sources: { links: [CAMEL], text: 'Some of the world’s 4 Mt of camel milk is drunk fermented.' } },
	mursik: { mt: 0.1, sources: { unsourced: true, text: 'Made at home in Kenya’s Rift Valley. My own rough estimate.' } },
	dadiah: { mt: 0.01, sources: { unsourced: true, text: 'Made in West Sumatra from buffalo milk. My own rough estimate.' } },
	kumis: { mt: 0.5, sources: { unsourced: true, text: 'Mare’s milk, mostly in Kazakhstan, Kyrgyzstan and Mongolia, nearly all of it drunk as kumis or airag. My own rough estimate.' } },
	byaslag: { mt: 0.05, sources: { unsourced: true, text: 'Made by Mongolian herders. My own rough estimate.' } },
	eezgii: { mt: 0.02, sources: { unsourced: true, text: 'Made by Mongolian herders in summer. My own rough estimate.' } },
	plantCheese: { mt: 0.1, sources: { unsourced: true, text: 'A few cheeses of Portugal, Spain and West Africa set with thistle or other plants. My own rough estimate.' } },
	donorMilk: { mt: 0.002, sources: { unsourced: true, text: 'Human milk, given by mothers to milk banks: not part of the world’s farmed milk. My own rough estimate.' } },
	milkDrugs: { mt: 0.0001, sources: { unsourced: true, text: 'The milk of a few herds of transgenic goats and rabbits. My own rough estimate.' } },
	milkSpray: { mt: 0.001, sources: { unsourced: true, text: 'Sprayed by gardeners against mildew. My own rough estimate.' } },
	colostrum: { mt: 0.1, sources: { unsourced: true, text: 'The first milk after calving, nearly all of it fed to the calf and not counted as milk; a little is sold, mostly dried. My own rough estimate.' } },
};
