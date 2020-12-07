const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const config = require('./config.json')


const vk = new VK({
	token: process.env.TOKEN || config.token
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
		db.read()
		var id = context.text.split(" ")[1];
		context.send("Попытка добавить в базу данных...")
		if(){
			
		}else {
			context.send("Ошибка добавления id в базу, возможно, вы ввели его не правильно или ни одной записи с этим id нет в базе! Прочитайте инструкцию и попробуйте снова")
		}
	}
})



vk.updates.start().catch(console.error);