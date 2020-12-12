const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');


const vk = new VK({
	token: process.env.TOKEN
});

const hearManager = new HearManager();

const mysql = require('mysql')

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
		var vk_id = {
      	vk_id: context.peerId
    	}
    	connection.query(`SELECT * FROM usres_vk WHERE id_p LIKE '${id}'`, (error, results, fields) => {
      	if (error) {
      		console.error('An error occurred while executing the query')
      		throw error
      	}
      	if(results[0]){
        	connection.query('INSERT INTO usres_vk SET ?', vk_id, (error, results, fields) => {
        	if(error){
         		console.error('An error occurred while executing the query')
            	throw error
          	}
        	})
        }else context.send("Ошибка добавления id в базу, возможно, вы ввели его не правильно или ни одной записи с этим id нет в базе! Прочитайте инструкцию и попробуйте снова")
    })
	}
})



vk.updates.start().catch(console.error);