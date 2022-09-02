let database

export default {
  create(db: string) {
    if(!database) {
      if(db == ':memory:') {
        const { MemoryLevel } = importDependency('memory-level')
        database = new MemoryLevel({encodingType: 'json'})
      } else { 
        const Level = importDependency("classic-level")
        database = new Level(db, { valueEncoding: 'json'})
      }
      database.open()
    }
    return database
  },
}

function importDependency(dependency: string) {
  try { 
    return require(`${dependency}`)
  } catch (e) {
    // User didn't install levelup db, show detailed error
    throw new Error(`To use the \`@walletconnect/keyvaluestorage\` dependency server side, you need to install \`${dependency}\`. If you are seeing this error in an SSR environment like Next.js or Remix and only intend to run the client in the browser, you can install \`keyvaluestorage\` devDependency to ensure that your builds are passing.`)
  }
}