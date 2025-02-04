import type { GeneratedQueryTypes } from "app/types/admin.generated";

export async function clientGraphQL<T extends keyof GeneratedQueryTypes>(query: T, options: {variables:  GeneratedQueryTypes[T]['variables']}) {
  const res = await fetch('shopify:admin/api/2025-01/graphql.json', {
    method: 'POST',
    body: JSON.stringify({
      query: query,
      variables: options.variables,
    }),
  });

  const data = (await res.json()) as {data: GeneratedQueryTypes[T]['return']};
  
  return data;
}