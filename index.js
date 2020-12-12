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
//VK START
const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');


const vk = new VK({
  token: process.env.TOKEN
});

const hearManager = new HearManager();

vk.updates.on('message_new', hearManager.middleware);

hearManager.hear('/start', async (context) => {
  await context.send(`
    Вы разрешили отправлять сообщения
    Введите команду /myid id, где id, ваш ид, чтобы добавить id аккаунта ПВ
  `);
});

vk.updates.on('message_new', async (context, next) => {
  if(context.text.startsWith('/myid')){
    var id = context.text.split(" ")[1];
    context.send("Попытка добавить в базу данных...")
      connection.query(`SELECT * FROM usres_vk WHERE id_p LIKE '${Number(id)}'`, (error, results, fields) => {
        if (error) {
          console.error('An error occurred while executing the query')
          throw error
        }
        if(results[0]){
          let q = `UPDATE 'usres_vk' SET 'vk_id' = '${Number(context.peerId)}' WHERE 'id_p' LIKE '${Number(id)}'`;
          connection.query(q, (error, results, fields) => {
            console.log(results)
          if(error){
            context.send("Ошибка добавления id в базу, возможно, вы ввели его не правильно или ни одной записи с этим id нет в базе! Прочитайте инструкцию и попробуйте снова")
            console.error('An error occurred while executing the query')
              throw error
            }
            context.send("Добавлено!")
          })
        }else context.send("Ошибка добавления id в базу, возможно, вы ввели его не правильно или ни одной записи с этим id нет в базе! Прочитайте инструкцию и попробуйте снова")
    })
  }
})



vk.updates.start().catch(console.error);
//VK END


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
    var vk_id = {
      id_p: body.id_p,
      vk_id: 0
    }
    connection.query(`SELECT * FROM usres_vk WHERE id_p LIKE '${body.id_p}'`, (error, results, fields) => {
      if (error) {
      console.error('An error occurred while executing the query')
      throw error
      }
      if(!results[0]){
        connection.query('INSERT INTO usres_vk SET ?', vk_id, (error, results, fields) => {
          if(error){
            console.error('An error occurred while executing the query')
            throw error
          }
        })
      }
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