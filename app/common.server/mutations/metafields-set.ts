import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { json } from "@remix-run/node";
import type { MetafieldsSetInput } from "../interfaces/shopify-metafield-interface"

export interface MetafieldsSetResponseDTO {
  metafields: Metafield[] | [];
  userErrors: UserError[] | [];
}

export interface Metafield {
  key:       string;
  namespace: string;
  value:     string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserError {
  field:   string[];
  message: string;
  code:    string;
}


export const metafieldsSet = async (admin:AdminApiContext,metafields: MetafieldsSetInput[]) => {
  console.log("metafields");
  console.log(metafields);
  
  const response  = await admin.graphql(
    `#graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
            code
          }
        }
      }`,
      {
        variables:{
         metafields,
        }
      }
    )
    
  const responseData = (await response.json()).data as MetafieldsSetResponseDTO
  return json(responseData)
}