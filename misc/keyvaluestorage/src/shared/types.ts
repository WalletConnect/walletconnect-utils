import { IAsyncStorage } from "../react-native/types";

export { IKeyValueStorage } from "keyvaluestorage-interface";
export interface ReactNativeStorageOptions {
  asyncStorage: IAsyncStorage;
}

export interface NodeJSStorageOptions {
  database: string;
  tableName?: string;
}

export type KeyValueStorageOptions = Partial<
  ReactNativeStorageOptions & NodeJSStorageOptions
>;
