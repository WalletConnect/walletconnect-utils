export const TEST_ID = 1;
export const TEST_METHOD = "test_method";
export const TEST_PARAMS = { something: true };
export const TEST_RESULT = { whatever: true };
export const TEST_ERROR_MESSAGE = "Something went wrong";
export const TEST_ERROR = { code: -32000, message: TEST_ERROR_MESSAGE };
export const TEST_JSONRPC_REQUEST = {
  id: TEST_ID,
  jsonrpc: "2.0",
  method: TEST_METHOD,
  params: TEST_PARAMS,
};
export const TEST_JSONRPC_RESULT = {
  id: TEST_ID,
  jsonrpc: "2.0",
  result: TEST_RESULT,
};
export const TEST_JSONRPC_ERROR = {
  id: TEST_ID,
  jsonrpc: "2.0",
  error: TEST_ERROR,
};
