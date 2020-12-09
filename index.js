var restify = require('restify');
const child_process = require('child_process');
const mysql = require('mysql')


var server = restify.createServer({
  name: 'Total Domination Helper',
  version: '0.9.0'
});

const options = {
  user: process.env.user,
  password: process.env.pass,
  database: process.env.db_name,
  host: process.env.host,
  port: process.env.port
}

const connection = mysql.createConnection(options)

connection.connect(err => {
  if (err) {
    console.error('An error occurred while connecting to the DB')
    throw err
  }else {
  	console.log("Подключено успешно")
  }
})

//const start = child_process.fork("./VK/index.js")


function AddToLowDB(body, res){
	var query_arr = {
		id_p: body.id_p,
		time_start: body.time_start,
		sign: body.sign,
		id: body.id,
		type: body.type,
		time_end: body.time_end
	}
  	connection.query('INSERT INTO tasks SET ?', query_arr, (error, results, fields) => {
  	if (error) {
    	res.send('Ошибка при работе с базой данных')
    	console.error('An error occurred while executing the query')
    	throw error
  	}
  	res.send({"message" : "Новое событие записано в базу данных"});
	})
}
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.jsonp());
server.use(restify.plugins.bodyParser({ mapParams: true }));

server.post('/buy', function(req, res){
	AddToLowDB(req.body, res)
});
server.post('/imp', function(req, res){
	AddToLowDB(req.body, res)
});
server.post('/powder', function(req, res){
	AddToLowDB(req.body, res)
});
server.post('/upgr', function(req, res){
	AddToLowDB(req.body, res)
});

server.listen(1984, function () {
  console.log('%s listening at %s', server.name, server.url);
});