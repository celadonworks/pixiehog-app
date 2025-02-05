export class ShopifyUserErrorException extends Error {
  message: string;
  context: Record<string, any>;

  constructor(message: string, context: ShopifyUserErrorException['context']) {
    super();
    this.message = message;
    this.context = context;
  }
}
