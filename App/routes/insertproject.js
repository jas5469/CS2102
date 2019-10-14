var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* SQL Query */
var sql_query = 'INSERT INTO projects VALUES';
var creator_query = 'SELECT * FROM creators';
var template_query = 'SELECT * FROM ProjectTemplates';

// GET
router.get('/', function(req, res, next) {
	pool.query(creator_query, (err, creator) => {
		pool.query(template_query, (err, template) => {
			res.render('insertproject', { title: 'New Project', creators: creator.rows, templates: template.rows });
		});
	});
});

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

// POST
router.post('/', function(req, res, next) {
	console.log(req.body);
	// Retrieve Information
	var name  = req.body.name;
	var cname = req.body.cname;
	var tname = req.body.tname;
	var s_date = date; //now
	var e_date = req.body.e_date;
	var f_goal = req.body.f_goal;
	var status = "FALSE";
	var descr = req.body.descr;
	
	// Construct Specific SQL Query
	var insert_query = sql_query + "('" + name + "','" + cname + "','" + tname + "','" + s_date + "','" + e_date + "','" + f_goal + "','" + status + "','" + descr + "')";
	pool.query(insert_query, (err, data) => {
		res.redirect('/select');
	});
});

module.exports = router;
