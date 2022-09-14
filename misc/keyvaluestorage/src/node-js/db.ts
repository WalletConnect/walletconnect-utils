import { KeyValueStorageOptions } from "../shared";

function importLokijs() {
  try {
    return require("lokijs");
  } catch (e) {
    // User didn't install levelup db, show detailed error
    throw new Error(
      `To use WalletConnect server side, you'll need to install the "lokijs" dependency. If you are seeing this error during a build / in an SSR environment, you can add "lokijs" as a devDependency to make this error go away.`
    );
  }
}

interface DbKeyValueStorageOptions extends KeyValueStorageOptions {
  callback: Function;
}

let lokijs;
const DB_NAME = "walletconnect.db";

export default class Db {
  private static instance: Db;
  public database: typeof lokijs;

  private constructor(opts: DbKeyValueStorageOptions) {
    if (!lokijs) {
      lokijs = importLokijs();
    }

    if (opts?.database == ":memory:") {
      this.database = new lokijs(opts?.database, {});
    } else {
      this.database = new lokijs(opts?.database || opts?.table || DB_NAME, {
        autoload: true,
        autoloadCallback: opts.callback,
      });
    }
  }

  public static create(opts: DbKeyValueStorageOptions): Db {
    if (opts.database == ":memory:") {
      return new Db(opts);
    }

    if (!Db.instance) {
      Db.instance = new Db(opts);
    }
    return Db.instance;
  }
}
