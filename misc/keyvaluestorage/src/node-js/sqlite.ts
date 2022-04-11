export class Statements {
  constructor(private readonly tableName: string) {}

  public createTable() {
    return `CREATE TABLE IF NOT EXISTS ${this.tableName} (key text unique, value text)`;
  }

  public replaceInto() {
    return `REPLACE INTO ${this.tableName} (key, value) VALUES (@key, @value)`;
  }

  public selectValueWhereKey() {
    return `SELECT value FROM ${this.tableName} WHERE key = ?`;
  }

  public selectValues() {
    return `SELECT value FROM ${this.tableName}`;
  }

  public selectKeys() {
    return `SELECT key FROM ${this.tableName}`;
  }

  public selectEntries() {
    return `SELECT key, value FROM ${this.tableName}`;
  }

  public deleteFromWhereKey() {
    return `DELETE FROM ${this.tableName} WHERE key = ?`;
  }
}
