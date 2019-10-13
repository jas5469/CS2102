var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  user: 'jasonleo',
  host: '/tmp',
  database: 'postgres',
  password: '96239896',
  port: 5432,
})

/* SQL Query */
var sql_query = 'INSERT INTO users VALUES';

// GET
router.get('/', function(req, res, next) {
	res.render('insert', { title: 'Register Account' });
});

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
console.log(date);
// POST
router.post('/', function(req, res, next) {
	// Retrieve Information
	var username  = req.body.username;
	var password    = req.body.password;
	
	// Construct Specific SQL Query
	var insert_query = sql_query + "('" + username + "','" + password + "','" + date + "')";
	
	pool.query(insert_query, (err, data) => {
		res.redirect('/select')
	});
});

module.exports = router;
