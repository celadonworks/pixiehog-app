export interface WebPixelCreateResponseData {
  webPixelCreate: WebPixelCreate;
}

export interface ErrorsWebPixelUserError {
  field: string;
  message: string;
  code: ErrorsWebPixelUserErrorCode,
}

export enum ErrorsWebPixelUserErrorCode {
  BLANK = "BLANK",
  INVALID_SETTINGS = "INVALID_SETTINGS",
  NOT_FOUND = "NOT_FOUND",
  TAKEN = "TAKEN",
  UNABLE_TO_DELETE = "UNABLE_TO_DELETE",
}


export interface WebPixelCreate {
  userErrors: ErrorsWebPixelUserError[];
  webPixel:   WebPixel;
}

export interface WebPixel {
  settings: string;
  id:       string;
}