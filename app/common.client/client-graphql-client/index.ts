import type { GeneratedQueryTypes, GeneratedMutationTypes } from "app/types/admin.generated";
import { Constant } from "../../../common/constant";


type GeneratedTypes = GeneratedQueryTypes & GeneratedMutationTypes

export async function clientGraphQL<T extends keyof GeneratedTypes>(query: T, options?: {variables:  GeneratedTypes[T]['variables']}) {
  const res = await fetch(`shopify:admin/api/${Constant.SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    body: JSON.stringify({
      query: query,
      ...(options?.variables && {
        variables: options.variables,
      }),
    }),
  });

  const data = (await res.json()) as {data: GeneratedTypes[T]['return']};
  
  return data;
}