import {
    IHttp,
 
} from "@rocket.chat/apps-engine/definition/accessors";

export async function getPlaces(http: IHttp): Promise<string | string[]> {
    const query = `
SELECT ?placeLabel ?cityLabel ?countryLabel WHERE {
  ?place wdt:P31/wdt:P279* wd:Q570116 ;
         wdt:P131 ?city ;
         wdt:P17 ?country .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5
`;
    const response = await http.get("https://query.wikidata.org/sparql", {
        headers: {
            Accept: "application/sparql-results+json",
        },
        params: {
            query: query,
        },
    });

    if (response.statusCode === 200) {
        const data = response.data;
        const places = data.results.bindings
            .map(
                (entry: any) =>
                    `${entry.placeLabel.value}, ${entry.cityLabel.value}, ${entry.countryLabel.value}`
            )
            .join("\n");
        return places;
    } else {
        return [
            "Eiffel Tower, Paris, France",
            "Statue of Liberty, New York City, United States of America",
            "Taj Mahal, Agra, India",
            "Big Ben, London, United Kingdom",
        ];
    }
}
