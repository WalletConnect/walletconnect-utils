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

interface DbKeyValueStorageOptions {
  db: string;
  callback: Function;
}

let Lokijs;

export default class Db {
  private static instances: Record<string, Db> = {};
  public database: typeof Lokijs;

  private constructor(opts: DbKeyValueStorageOptions) {
    if (!Lokijs) {
      Lokijs = importLokijs();
    }

    if (opts?.db === ":memory:") {
      this.database = new Lokijs(opts?.db, {});
    } else {
      this.database = new Lokijs(opts?.db, {
        autoload: true,
        autoloadCallback: opts.callback,
      });
    }
  }

  public static create(opts: DbKeyValueStorageOptions): Db {
    const db = opts.db;
    if (db === ":memory:") {
      return new Db(opts);
    }

    if (!Db.instances[db]) {
      Db.instances[db] = new Db(opts);
    }
    return Db.instances[db];
  }
}
