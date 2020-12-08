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
/*	db.read()
	if(!db.has(`${body.id_p}`).value()){
		db.set(`${body.id_p}`, {"vk_id" : 0, "actions": []})
		  .write()
	}

		if(body.time_end === undefined){
			if(!db.get(`${body.id_p}.actions`).find({ sign: body.sign }).value()){
				db.get(`${body.id_p}.actions`)
  			  .push({ type: body.type, id: body.id, time_start: body.time_start, sign: body.sign, time_end: 0})
  			  .write()
			}else {
			db.get(`${body.id_p}.actions`)
			  .find({ sign: body.sign })
  			  .assign({ id: body.id, time_start: body.time_start, sign: body.sign})
  			  .write()
  			}
		}if(body.time_end != undefined){
			if(!db.get(`${body.id_p}.actions`).find({ sign: body.sign }).value()){
				db.get(`${body.id_p}.actions`)
				.push({ type: body.type, id: 0, time_start: 0, sign: body.sign, time_end: body.time_end})
  			  	.write()
			}else {
			db.get(`${body.id_p}.actions`)
			  .find({ sign: body.sign })
			  .assign({time_end: body.time_end})
			  .write()
			  }
}*/
if(body.time_end === undefined){
	connection.query('INSERT INTO tasks (`id_p`, `time_start`, `time_end`, `sign`, `i`, `id`, `id_incr`, `type`) VALUES ('`${body.id_p}`', '`${body.time_start}`', NULL, '`${body.sign}`', NULL, '`${body.id}`', NULL, '`${body.type}`');', (error, results, fields) => {
  if (error) {
    console.error('An error occurred while executing the query')
    throw error
    res.send('Ошибка при работе с базой данных')
  }
})
}else {
	connection.query('INSERT INTO tasks (`time_end`) VALUES ('`${body.time_end}`');', (error, results, fields) => {
  if (error) {
    console.error('An error occurred while executing the query')
    throw error
    res.send('Ошибка при работе с базой данных')
  }else {
  	res.send({"message" : "Новое событие записано в базу данных"});
  }
})
}
}

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.jsonp());
server.use(restify.plugins.bodyParser({ mapParams: true }));

server.post('/buy', function(req, res){
	AddToLowDB(req.body)
});
server.post('/imp', function(req, res){
	AddToLowDB(req.body)
});
server.post('/powder', function(req, res){
	AddToLowDB(req.body)
});
server.post('/upgr', function(req, res){
	AddToLowDB(req.body)
});

server.listen(1984, function () {
  console.log('%s listening at %s', server.name, server.url);
});