// not a real test

init()

async function init () {
  const { PostgresDAO } = require('../src/index.js')
  const PGDAOConfig = {
    host: 'localhost',
    port: 5432,
    user: 'eguser',
    password: 'egpassword',
    database: 'egdb',
  }
  const dao = await PostgresDAO.from(PGDAOConfig)
  if (dao.connected()) {
    console.log(`good`)
  } else {
    console.log(`not so good`)
  }
}
