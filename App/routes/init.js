const sql_query = require('../sql');
const passport = require('passport');
const bcrypt = require('bcrypt');
const moment = require('moment');

// Postgre SQL Connection
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	//ssl: true
});

const round = 10;
const salt = bcrypt.genSaltSync(round);

function initRouter(app) {
	/* GET */
	app.get('/', index);
	app.get('/search', search);

	/* PROTECTED GET */
	app.get('/dashboard', passport.authMiddleware(), dashboard);
	app.get('/games', passport.authMiddleware(), games);
	app.get('/plays', passport.authMiddleware(), plays);

	app.get('/all_projects', passport.authMiddleware(), allprojects);
	app.get('/projects', passport.authMiddleware(), projects);
	app.get('/projectInfo', passport.authMiddleware(), projectInfo);
	app.get('/projectInfo/:id', passport.authMiddleware(), projectInfo);

	app.get('/templates', passport.authMiddleware(), templates);
	app.get('/creators', passport.authMiddleware(), creators);
	app.get('/fundings', passport.authMiddleware(), fundings);
	app.get('/likedprojects', passport.authMiddleware(), likedprojects)
	// app.post('/checkLiked'   , passport.authMiddleware(), checkLiked);

	app.get('/register', passport.antiMiddleware(), register);
	app.get('/password', passport.antiMiddleware(), retrieve);

	/* PROTECTED POST */
	app.post('/update_info', passport.authMiddleware(), update_info);
	app.post('/update_pass', passport.authMiddleware(), update_pass);
	app.post('/add_game', passport.authMiddleware(), add_game);
	app.post('/add_play', passport.authMiddleware(), add_play);

	app.post('/add_project', passport.authMiddleware(), add_project);
	app.post('/add_fund/:id', passport.authMiddleware(), add_fund);
	app.post('/add_template', passport.authMiddleware(), add_template);
	app.post('/add_follower', passport.authMiddleware(), add_follower);

	app.post('/delete_follower', passport.authMiddleware(), delete_follower);

	app.post('/reg_user', passport.antiMiddleware(), reg_user);

	app.post('/like_project', passport.authMiddleware(), like_project);
	app.post('/unlike_project', passport.authMiddleware(), unlike_project);

	/* LOGIN */
	app.post('/login', passport.authenticate('local', {
		successRedirect: '/dashboard',
		failureRedirect: '/'
	}));

	/* LOGOUT */
	app.get('/logout', passport.authMiddleware(), logout);
}


// Render Function
function basic(req, res, page, other) {
	var info = {
		page: page,
		username: req.user.username,
		firstname: req.user.firstname,
		lastname: req.user.lastname,
		rdate: req.user.r_date,
	};
	if (other) {
		for (var fld in other) {
			info[fld] = other[fld];
		}
	}
	res.render(page, info);
}
function query(req, fld) {
	return req.query[fld] ? req.query[fld] : '';
}
function msg(req, fld, pass, fail) {
	var info = query(req, fld);
	return info ? (info == 'pass' ? pass : fail) : '';
}

// GET
function index(req, res, next) {
	var ctx = 0, idx = 0, tbl, total;
	if (Object.keys(req.query).length > 0 && req.query.p) {
		idx = req.query.p - 1;
	}
	pool.query(sql_query.query.page_lims, (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			tbl = [];
		} else {
			tbl = data.rows;
		}
		pool.query(sql_query.query.ctx_games, (err, data) => {
			if (err || !data.rows || data.rows.length == 0) {
				ctx = 0;
			} else {
				ctx = data.rows[0].count;
			}
			total = ctx % 10 == 0 ? ctx / 10 : (ctx - (ctx % 10)) / 10 + 1;
			console.log(idx * 10, idx * 10 + 10, total);
			if (!req.isAuthenticated()) {
				res.render('index', { page: '', auth: false, tbl: tbl, ctx: ctx, p: idx + 1, t: total });
			} else {
				basic(req, res, 'index', { page: '', auth: true, tbl: tbl, ctx: ctx, p: idx + 1, t: total });
			}
		});
	});
}
function search(req, res, next) {
	var ctx = 0, avg = 0, tbl;
	var game = "%" + req.query.gamename.toLowerCase() + "%";
	pool.query(sql_query.query.search_game, [game], (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			ctx = 0;
			tbl = [];
		} else {
			ctx = data.rows.length;
			tbl = data.rows;
		}
		if (!req.isAuthenticated()) {
			res.render('search', { page: 'search', auth: false, tbl: tbl, ctx: ctx });
		} else {
			basic(req, res, 'search', { page: 'search', auth: true, tbl: tbl, ctx: ctx });
		}
	});
}
function dashboard(req, res, next) {
	basic(req, res, 'dashboard', { info_msg: msg(req, 'info', 'Information updated successfully', 'Error in updating information'), pass_msg: msg(req, 'pass', 'Password updated successfully', 'Error in updating password'), auth: true });
}
function games(req, res, next) {
	var ctx = 0, avg = 0, tbl;
	pool.query(sql_query.query.avg_rating, [req.user.username], (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			avg = 0;
		} else {
			avg = data.rows[0].avg;
		}
		pool.query(sql_query.query.all_games, [req.user.username], (err, data) => {
			if (err || !data.rows || data.rows.length == 0) {
				ctx = 0;
				tbl = [];
			} else {
				ctx = data.rows.length;
				tbl = data.rows;
			}
			basic(req, res, 'games', { ctx: ctx, avg: avg, tbl: tbl, game_msg: msg(req, 'add', 'Game added successfully', 'Game does not exist'), auth: true });
		});
	});
}
function plays(req, res, next) {
	var win = 0, avg = 0, ctx = 0, tbl;
	pool.query(sql_query.query.count_wins, [req.user.username], (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			win = 0;
		} else {
			win = data.rows[0].count;
		}
		pool.query(sql_query.query.all_plays, [req.user.username], (err, data) => {
			if (err || !data.rows || data.rows.length == 0) {
				ctx = 0;
				avg = 0;
				tbl = [];
			} else {
				ctx = data.rows.length;
				avg = win == 0 ? 0 : win / ctx;
				tbl = data.rows;
			}
			basic(req, res, 'plays', { win: win, ctx: ctx, avg: avg, tbl: tbl, play_msg: msg(req, 'add', 'Play added successfully', 'Invalid parameter in play'), auth: true });
		});
	});
}
function allprojects(req, res, next) {
	var ctx = 0, avg = 0, tbl, templates;
	pool.query(sql_query.query.all_projects, (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			ctx = 0;
			tbl = [];
		} else {
			ctx = data.rows.length;
			tbl = data.rows;
		}
		basic(req, res, 'allprojects', { ctx: ctx, tbl: tbl, templates: templates, moment: moment, auth: true });
	});
}
function projects(req, res, next) {
	var ctx = 0, avg = 0, tbl, templates;
	pool.query(sql_query.query.user_projects, [req.user.username], (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			ctx = 0;
			tbl = [];
		} else {
			ctx = data.rows.length;
			tbl = data.rows;
		}
		pool.query(sql_query.query.all_templates, (err, data) => {
			if (err || !data.rows || data.rows.length == 0) {
				templates = [];
			} else {
				templates = data.rows;
			}
			basic(req, res, 'projects', { ctx: ctx, tbl: tbl, templates: templates, moment: moment, project_msg: msg(req, 'add', 'Project added successfully', 'Project does not exist'), auth: true });
		});
	});
}
function projectInfo(req, res, next) {
	var ctx = 0, avg = 0, tbl, tiers, likes;
	var pname = req.params.id;
	var username = req.user.username;
    function isLiked(name, liked_projects) {
		for (var i=0; i<liked_projects.length; i++) {
			if (liked_projects[i].pname === name) return true
		}
		return false
    }
	pool.query(sql_query.query.project_info, [pname], (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			ctx = 0;
			tbl = [];
		} else {
			ctx = data.rows.length;
			tbl = data.rows;
		}
		pool.query(sql_query.query.get_tier, [pname], (err, data) => {
			if (err || !data.rows || data.rows.length == 0) {
				tiers = [];
			} else {
				tiers = data.rows;
			}
			pool.query(sql_query.query.all_liked, [username], (err, data) => {
				if (err || !data.rows || data.rows.length === 0) {
					likes = [];
				} else {
					likes = data.rows;
				}
				basic(req, res, 'projectInfo', { isLiked: isLiked, ctx: ctx, tbl: tbl, tiers: tiers, likes: likes, moment: moment, project_msg: msg(req, 'add', 'Project loaded', 'Project does not exist'), auth: true });
			})
		});
	});
}
function templates(req, res, next) {
	var ctx = 0, avg = 0, tbl;
	pool.query(sql_query.query.all_templates, (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			ctx = 0;
			tbl = [];
		} else {
			ctx = data.rows.length;
			tbl = data.rows;
		}
		basic(req, res, 'templates', { ctx: ctx, tbl: tbl, template_msg: msg(req, 'add', 'Template added successfully', 'Template does not exist'), auth: true });
	});
}
function creators(req, res, next) {
	var ctx = 0, avg = 0, tbl, follow_tbl;
	pool.query(sql_query.query.all_creators, [req.user.username], (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			ctx = 0;
			tbl = [];
		} else {
			ctx = data.rows.length;
			tbl = data.rows;
		}
		pool.query(sql_query.query.all_follows, [req.user.username], (err, data) => {
			if (err || !data.rows || data.rows.length == 0) {
				follow_tbl = [];
			} else {
				follow_tbl = data.rows;
			}
			basic(req, res, 'creators', { ctx: ctx, tbl: tbl, follow_tbl: follow_tbl, auth: true });
		});
	});
}
function fundings(req, res, next) {
	var ctx = 0, avg = 0, tbl;
	pool.query(sql_query.query.all_fundings, [req.user.username], (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			ctx = 0;
			tbl = [];
		} else {
			ctx = data.rows.length;
			tbl = data.rows;
		}
		basic(req, res, 'fundings', { ctx: ctx, tbl: tbl, moment: moment, auth: true });
	});
}

function likedprojects(req, res, next) {
	var ctx = 0, avg = 0, likes;
	var username = req.user.username;
	pool.query(sql_query.query.all_liked, [username], (err, data) => {
		if (err || !data.rows || data.rows.length === 0) {
			ctx = 0;
			likes = [];
		} else {
			ctx = data.rows.length;
			likes = data.rows;
		}
		basic(req, res, 'likedprojects', { ctx: ctx, likes: likes, auth: true });
	});
}

function register(req, res, next) {
	res.render('register', { page: 'register', auth: false });
}
function retrieve(req, res, next) {
	res.render('retrieve', { page: 'retrieve', auth: false });
}


// POST 
function update_info(req, res, next) {
	var username = req.user.username;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	pool.query(sql_query.query.update_info, [username, firstname, lastname], (err, data) => {
		if (err) {
			console.error("Error in update info");
			res.redirect('/dashboard?info=fail');
		} else {
			res.redirect('/dashboard?info=pass');
		}
	});
}
function update_pass(req, res, next) {
	var username = req.user.username;
	var password = bcrypt.hashSync(req.body.password, salt);
	pool.query(sql_query.query.update_pass, [username, password], (err, data) => {
		if (err) {
			console.error("Error in update pass");
			res.redirect('/dashboard?pass=fail');
		} else {
			res.redirect('/dashboard?pass=pass');
		}
	});
}

function add_game(req, res, next) {
	var username = req.user.username;
	var gamename = req.body.gamename;

	pool.query(sql_query.query.add_game, [username, gamename], (err, data) => {
		if (err) {
			console.error("Error in adding game");
			res.redirect('/games?add=fail');
		} else {
			res.redirect('/games?add=pass');
		}
	});
}
function add_play(req, res, next) {
	var username = req.user.username;
	var player1 = req.body.player1;
	var player2 = req.body.player2;
	var gamename = req.body.gamename;
	var winner = req.body.winner;
	if (username != player1 || player1 == player2 || (winner != player1 && winner != player2)) {
		res.redirect('/plays?add=fail');
	}
	pool.query(sql_query.query.add_play, [player1, player2, gamename, winner], (err, data) => {
		if (err) {
			console.error("Error in adding play");
			res.redirect('/plays?add=fail');
		} else {
			res.redirect('/plays?add=pass');
		}
	});
}
function add_project(req, res, next) {
	var username = req.user.username;
	var pname = req.body.pname;
	var tname = req.body.tname;
	var today = new Date();
	var s_date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	var e_date = req.body.e_date;
	var f_goal = req.body.f_goal;
	var descr = req.body.descr;
	pool.query(sql_query.query.add_project, [pname, username, tname, s_date, e_date, f_goal, descr], (err, data) => {
		if (err) {
			console.error("Error in adding project");
			res.redirect('/projects?add=fail');
		} else {
			res.redirect('/projects?add=pass');
		}
	});
}
function add_follower(req, res, next) {
	var username = req.user.username;
	var cname = req.body.cname;
	pool.query(sql_query.query.add_follower, [username, cname], (err, data) => {
		if (err) {
			console.error("Error in adding follower");
			res.redirect('/creators?add=fail');
		} else {
			res.redirect('/creators?add=pass');
		}
	});
}
function delete_follower(req, res, next) {
	var username = req.user.username;
	var cname = req.body.cname;
	pool.query(sql_query.query.delete_follower, [username, cname], (err, data) => {
		if (err) {
			console.error("Error in deleting follower");
			res.redirect('/creators?delete=fail');
		} else {
			res.redirect('/creators?delete=pass');
		}
	});
}
function add_template(req, res, next) {
	var aname = req.user.username;
	var tname = req.body.tname;
	var category = req.body.category;
	var style = req.body.style;
	pool.query(sql_query.query.add_template, [tname, category, style, aname], (err, data) => {
		if (err) {
			console.error("Error in adding project template");
			console.error(err);
			res.redirect('/templates?add=fail');
		} else {
			res.redirect('/templates?add=pass');
		}
	});
}
function add_fund(req, res, next) {
	var username = req.user.username;
	var pname = req.params.id;
	var today = new Date();
	var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	var funding = parseInt(req.body.funding);
	var status = "t";
	pool.query(sql_query.query.get_tier, [pname, funding], (err, data) => {
		if (err || !data.rows || data.rows.length == 0) {
			console.error("Error in getting tier");
			res.redirect('/projects');
		} else {
			tname = data.rows[0].tname;
		}
		pool.query(sql_query.query.add_fund, [pname, tname, username, date, funding, status], (err, data) => {
			if (err) {
				console.error("Error in adding fund");
				res.redirect('/projects');
			} else {
				res.redirect('/fundings');
			}
		});
	});
}

// function add_fund(req, res, next) {
//     var username = req.user.username;
//     var pname  = req.params.id;
//     var today = new Date();
//     var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//     var status = "t";
//     var tnameFunding = req.body.tier.split(",");
// 	var tname = tnameFunding[0];
// 	var funding = tnameFunding[1];
//     pool.query(sql_query.query.add_fund, [pname, tname, username, date , funding , status ], (err, data) => {
//         if(err) {
//             console.error("Error in adding fund");
//             res.redirect('/fundings?add=fail');
//         } else {
//             res.redirect('/fundings?add=pass');
// }
// });
// }

function reg_user(req, res, next) {
	var username = req.body.username;
	var password = bcrypt.hashSync(req.body.password, salt);
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var today = new Date();
	var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	pool.query(sql_query.query.add_user, [username, password, firstname, lastname, date], (err, data) => {
		if (err) {
			console.error("Error in adding user", err);
			res.redirect('/register?reg=fail');
		} else {
			req.login({
				username: username,
				passwordHash: password,
			}, function (err) {
				if (err) {
					return res.redirect('/register?reg=fail');
				} else {
					return res.redirect('/dashboard');
				}
			});
		}
	});
}

// function checkLiked(req, res, next) {
// 	var username = req.user.username;
// 	var pname  = req.body.pname; 
// 	console.log("checking")
// 	pool.query(sql_query.query.like_project, [username, pname], (err, data) => {
// 		if(err.includes("duplicate key value")) {
// 			console.error(`Error: ${err}`);
// 			return false;
// 		} else {
// 			return true;
// 		} 
// 	});
// }

function like_project(req, res, next) {
	var username = req.user.username;
	var pname = req.body.pname;
	pool.query(sql_query.query.like_project, [username, pname], (err, data) => {
		if (err) {
			console.error(`Error: ${err}`);
			res.redirect('back');
		} else {
			res.redirect('back');
		}
	});
}
function unlike_project(req, res, next) {
	var username = req.user.username;
	var pname = req.body.pname;
	pool.query(sql_query.query.unlike_project, [username, pname], (err, data) => {
		if (err) {
			console.error(`Error: ${err}`);
			res.redirect('back');
		} else {
			res.redirect('back');
		}
	});
}

// LOGOUT
function logout(req, res, next) {
	req.session.destroy()
	req.logout()
	res.redirect('/')
}

module.exports = initRouter;