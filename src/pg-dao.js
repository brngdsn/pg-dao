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

  async create(table, data) {
    const fields = Object.keys(data).join(',');
    const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(',');
    const values = Object.values(data);
    const sql = `INSERT INTO ${table} (${fields}) VALUES (${placeholders}) RETURNING *`;
    console.log({ sql, values });
    const { rows } = await this.pool.query(sql, values);
    return rows[0];
  }

  async read(table, select = { '*': true }, where = {}, limit = 25) {
    const select_keys = Object.keys(select).join(',');
    const whereKeys = Object.keys(where);
    const wherePlaceholders = whereKeys.map((_, index) => `${whereKeys[index]} = $${index + 1}`).join(' and ');
    const values = Object.values(where);

    let sql = `SELECT ${select_keys} FROM ${table}`;
    if (wherePlaceholders.length) {
        sql += ` WHERE ${wherePlaceholders}`;
    }
    
    values.push(limit);
    sql += ` LIMIT $${values.length}`;
    
    console.log({ sql, values });
    const { rows } = await this.pool.query(sql, values);
    return rows;
  }

  async update(table, where = { id: null }, data) {
    const whereKeys = Object.keys(where);
    const dataKeys = Object.keys(data);
    
    // Create placeholders for SET and WHERE clauses
    const setPlaceholders = dataKeys.map((_, index) => `${dataKeys[index]} = $${index + 1}`).join(',');
    const wherePlaceholders = whereKeys.map((_, index) => `${whereKeys[index]} = $${dataKeys.length + index + 1}`).join(' and ');

    const sql = `UPDATE ${table} SET ${setPlaceholders} WHERE ${wherePlaceholders} RETURNING *`;

    // Combine values for SET and WHERE clauses
    const values = [...Object.values(data), ...Object.values(where)];

    console.log({ sql, values });
    const { rows } = await this.pool.query(sql, values);
    return rows[0];
  }

  async delete(table, where = { id: null }) {
    const whereKeys = Object.keys(where);
    
    // Create placeholders for the WHERE clause
    const wherePlaceholders = whereKeys.map((_, index) => `${whereKeys[index]} = $${index + 1}`).join(' and ');

    const sql = `DELETE FROM ${table} WHERE ${wherePlaceholders} RETURNING *`;

    // Extract values for the WHERE clause
    const values = Object.values(where);

    console.log({ sql, values });
    const { rows } = await this.pool.query(sql, values);
    return rows[0];
  }

}