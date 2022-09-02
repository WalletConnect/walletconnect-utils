let database

export default {
  create(db: string) {
    if(!database) {
      if(db == ':memory:') {
        const { MemoryLevel } = require('memory-level')
        database = new MemoryLevel({encodingType: 'json'})
      } else { 
        try { 
          const Level = require("classic-level")
          database = new Level(db, { valueEncoding: 'json'})
        } catch (e) {
          // User didn't install levelup db, show detailed error
          throw new Error('To use sign sdk on server side, you need to instal `classic-level`... If you are seeing this error in ssr environment like nextjs or remix and only intend to run sign client in the browser, you can install this as a devDependency to ensure that your builds are passing')
        }
      }
      database.open()
    }
    return database
  },
}