var express = require('express');
var router = express.Router();
var moment = require('moment');

const { Pool } = require('pg')
/* --- V7: Using Dot Env ---
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '********',
  port: 5432,
})
*/
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

console.log(process.env.DATABASE_URL);

/* SQL Query */
var sql_query = 'SELECT * FROM Projects p, ProjectTemplates pt WHERE p.tname=pt.tname';

router.get('/', function(req, res, next) {
	pool.query(sql_query, (err, data) => {
		res.render('select', { title: 'Projects', data: data.rows, moment:moment });
	});
});

module.exports = router;
