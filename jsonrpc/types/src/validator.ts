export interface JsonRpcValidationResult {
  valid: boolean;
  error?: string;
}

export interface JsonRpcValidationValid extends JsonRpcValidationResult {
  valid: true;
}

export interface JsonRpcValidationInvalid extends JsonRpcValidationResult {
  valid: false;
  error: string;
}

export type JsonRpcValidation = JsonRpcValidationValid | JsonRpcValidationInvalid;
