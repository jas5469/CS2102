var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  user: 'jasonleo',
  host: '/tmp',
  database: 'postgres',
  password: 'password',
  port: 5432,
})

/* SQL Query */
var sql_query = 'SELECT * FROM users';

router.get('/', function(req, res, next) {
	pool.query(sql_query, (err, data) => {
		res.render('select', { title: 'Database Connect', data: data.rows });
	});
});

console.log("here");

module.exports = router;
