let database;

export default {
  create(db: string) {
    if (!database) {
      if (db === ":memory:") {
        const { MemoryLevel } = importDependency("memory-level");
        database = new MemoryLevel({ encodingType: "json" });
      } else {
        const Level = importDependency("classic-level");
        database = new Level(db, { valueEncoding: "json" });
      }
      database.open();
    }
    return database;
  },
};

function importDependency(dependency: string) {
  try {
    return require(`${dependency}`);
  } catch (e) {
    // User didn't install levelup db, show detailed error
    throw new Error(
      `To use WalletConnect server side, you'll need to install "\`${dependency}\`" dependency . If you are seeing this error during build / in SSR environment, you can add it as a devDependency to make this error go away.`
    );
  }
}
