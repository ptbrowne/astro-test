const mapValues = (obj, fn) => {
  const res = {};
  for (let [k, v] of Object.entries(obj)) {
    res[k] = fn(v, k);
  }
  return res;
};

const query = (
  operatorIds: string[]
) => `SELECT ?d_period (AVG(?d_total) as ?d_total) ?d_operator_name ?d_operator
WHERE {
  <https://energy.ld.admin.ch/elcom/electricityprice> <https://cube.link/observationSet> ?observationSet0 .
  ?observationSet0 <https://cube.link/observation> ?source0 .
  ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/operator> ?d_operator .
  ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/period> ?d_period .
  ?source0 <https://energy.ld.admin.ch/elcom/electricityprice/dimension/total> ?d_total .
  
  VALUES ?d_operator {
    ${operatorIds
      .map(
        (oid) =>
          `<https://energy.ld.admin.ch/elcom/electricityprice/operator/${oid}>`
      )
      .join("\n")}
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

const parseRdf = (rows: Record<string, { value: string }>[]) => {
  return rows.map((r) => mapValues(r, (v) => v.value));
};

export const fetchLindas = (query: string) => {
  const resp = fetch("https://lindas.admin.ch/query", {
    body: `query=${encodeURIComponent(query)}`,
    method: "POST",
    headers: {
      Accept: "application/sparql-results+json",
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  })
    .then((x) => x.json())
    .then((x) => parseRdf(x.results.bindings));
  return resp;
};

export const fetchData = (operatorIds) => fetchLindas(query(operatorIds));
