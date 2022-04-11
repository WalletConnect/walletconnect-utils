import { IAsyncStorage } from "../react-native/types";

export { IKeyValueStorage } from "keyvaluestorage-interface";
export interface ReactNativeStorageOptions {
  asyncStorage: IAsyncStorage;
}

export type KeyValueStorageOptions = Partial<ReactNativeStorageOptions>;
