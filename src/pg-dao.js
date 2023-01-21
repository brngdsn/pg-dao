const { Pool } = require('pg');

module.exports = class PostgresDAO {

  static async from (config) {
    const dao = new this(config)
    dao.pool.on('connect', () => dao._connected = true)
    await dao.pool.connect()
    return dao
  }

  constructor(config) {
    this._connected = false
    this.pool = new Pool(config);
  }

  connected () {
    return (req, res, next) => {
      if (this._connected) {
        return next()
      } else {
        return res.sendStatus(501)
      }
    }
  }

  async create (table, data) {
    const fields = Object.keys(data).join(',');
    const values = Object.values(data).map(value => `'${value}'`).join(',');
    const sql = `INSERT INTO ${table} (${fields}) VALUES (${values}) RETURNING *`;
    console.log({ sql })
    const { rows } = await this.pool.query(sql);
    return rows[0];
  }

  async read (table, select = { '*': true }, where = { }, limit = 25) {
    const select_keys = Object.keys(select).join(',');
    const where_clause = Object.keys(where).map(field => `${field} = '${where[field]}'`).join('');
    const sql = `SELECT ${select_keys} FROM ${table} ${where_clause.length ? `WHERE ${where_clause}` : ``} LIMIT ${limit}`;
    console.log({ sql })
    const { rows } = await this.pool.query(sql);
    return rows;
  }

  async update (table, where = { id: null }, data) {
    const where_clause = Object.keys(where).map(field => `${field} = '${where[field]}'`).join('');
    const fields = Object.keys(data).map(field => `${field} = '${data[field]}'`).join(',');
    const sql = `UPDATE ${table} SET ${fields} WHERE ${where_clause} RETURNING *`;
    console.log({ sql })
    const { rows } = await this.pool.query(sql);
    return rows[0];
  }

  async delete (table, where = { id: null }) {
    const where_clause = Object.keys(where).map(field => `${field} = '${where[field]}'`).join('');
    const sql = `DELETE FROM ${table} WHERE ${where_clause} RETURNING *`;
    console.log({ sql })
    const { rows } = await this.pool.query(sql);
    return rows[0];
  }
}