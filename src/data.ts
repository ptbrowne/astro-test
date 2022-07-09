const makeOperatorFilter = (operatorIds: string[]) => {
  return operatorIds
    .map(
      (oid) =>
        `?d_operator = <https://energy.ld.admin.ch/elcom/electricityprice/operator/${oid}>`
    )
    .join(" || ");
};

const query = (
  operatorIds: string[]
) => `SELECT DISTINCT ?d_period (AVG(?d_total) as ?d_total) ?d_operator_name ?d_operator
WHERE {
  <https://energy.ld.admin.ch/elcom/electricityprice> <https://cube.link/observationSet> ?observationSet0 .
  ?observationSet0 <https://cube.link/observation> ?source0 .
  ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/category> ?d_category .
  ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/municipality> ?d_municipality .
  ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator> ?d_operator .
  ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/period> ?d_period .
  ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/total> ?d_total .
  ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/product> ?d_product .
  
  FILTER (
    ${makeOperatorFilter(operatorIds)}
  )

    OPTIONAL {
    ?d_municipality <http://schema.org/containedInPlace> ?d_canton .
        ?d_canton <http://schema.org/identifier> ?d_canton_id .

    FILTER (
      (?d_canton_id != "CHE")
    )
  }
  OPTIONAL {
    ?d_operator <http://schema.org/name> ?d_operator_en .
    FILTER (
      LANGMATCHES(LANG(?d_operator_en), "en")
    )
  }
  OPTIONAL {
    ?d_operator <http://schema.org/name> ?d_operator_x .
    FILTER (
      (LANG(?d_operator_x) = "")
    )
  }
  BIND(COALESCE(?d_operator_en, ?d_operator_x) AS ?d_operator_name)
  
} 

GROUP BY ?d_period ?d_category_name ?d_operator_name ?d_operator
ORDER BY ?d_period
`;
export const fetchLindas = (query: string) => {
  console.log({ query });
  const resp = fetch("https://lindas.admin.ch/query", {
    body: `query=${encodeURIComponent(query)}`,
    method: "POST",
    headers: {
      Accept: "application/sparql-results+json",
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  }).then((x) => x.json());
  return resp;
};

export const fetchData = (operatorIds) => fetchLindas(query(operatorIds));
