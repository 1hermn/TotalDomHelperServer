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
  } else {
    console.log("Подключено успешно")
  }
})
//VK START
const {
  VK
} = require('vk-io');
const {
  HearManager
} = require('@vk-io/hear');


const vk = new VK({
  token: process.env.TOKEN
});

const hearManager = new HearManager();

vk.updates.on('message_new', hearManager.middleware);

hearManager.hear('/start', async(context) => {
  await context.send(`
    Вы разрешили отправлять сообщения
    Введите команду /myid id, где id, ваш ид, чтобы добавить id аккаунта ПВ
  `);
});

vk.updates.on('message_new', async(context, next) => {
  if (context.text.startsWith('/myid')) {
    var id = context.text.split(" ")[1];
    context.send("Попытка добавить в базу данных...")
    let q = 'SELECT * FROM `usres_vk` WHERE `id_p` LIKE ' + `'${id}'`
    connection.query(q, (error, results, fields) => {
      if (error) {
        console.error('An error occurred while executing the query')
        throw error
      }
      if (results[0]) {
        let q = 'UPDATE `usres_vk` SET `vk_id` = ' + context.peerId + ' WHERE `id_p` = ' + `'${id}'`;
        connection.query(q, (error, results, fields) => {
          console.log(q)
          console.log(results)
          if (error) {
            context.send("Ошибка добавления id в базу, возможно, вы ввели его не правильно или ни одной записи с этим id нет в базе! Прочитайте инструкцию и попробуйте снова")
            console.error('An error occurred while executing the query')
            throw error
          }
          context.send("Добавлено!")
        })
      } else context.send("Ошибка добавления id в базу, возможно, вы ввели его не правильно или ни одной записи с этим id нет в базе! Прочитайте инструкцию и попробуйте снова")
    })
  }
})

let cycle = setInterval(async() => {
  //получить все данные из бд tasks
  //для каждого сравнить time_end с текущим + 2 мин
  //если есть совпадение, то найти по id_p в users_vk вк и отправить. 
  //если vk_id == 0, то ничего не делать.
  //иначе -> отправить по вк сообщение
  //после успешной отправки удалить запись
  connection.query('SELECT * FROM `tasks`', (error, results, fields) => {
    if (error) {
      res.send('Ошибка при работе с базой данных')
      console.error('An error occurred while executing the query')
      throw error
    }
    if (results[0]) {
      for (i = 0; i < results.length; i++) {
        let now = new Date();
        now = now.toString();
        now = new Date(now);
        now = now.getTime();

        let time_end = new Date(results[i].time_end)
        time_end = time_end.toString();
        time_end = new Date(time_end);
        time_end = time_end.getTime();

        console.log(`DB: ${time_end}`, `Local: ${now}`)

              var type = results[i].type
              var id_1 = results[i].id
              var id_p_1 = results[i].id_p
        if (Math.abs(time_end - now) <= 500 * 60) { //позже избавиться от погрешности
          console.log(results[i])
          //отправка сообщения в вк. 
          //Find in usres_vk где id_p развен текущему id_p и отправить по vk_id сообщение. от том, что метод(позже сделать таблицу перевод), строение (тоже табличкой), улучшено. Причём это делать желательно в отдельном процессе. Чтобы не сбить весь счётчик. Но наверное node.js так и делает
          //и потом удалить запись используя num из первого результата ;)
          let sql = "SELECT * FROM `usres_vk` WHERE `id_p` LIKE " + `'${results[i].id_p_1}'`

          connection.query(sql, (error, vk_ids, fields) => {
            if (error) {
              console.error('An error occurred while executing the query')
              throw error
            }
            if(vk_ids[0]){
              //let lvl = results[i].lvl
              vk.api.messages.send({
                message: `Событие завершено!\nТип: ${type}\nid здания/ячейки и т.д : ${id_1}`,
                peerId: vk_ids[0].vk_id
              })
            }
            //тут удалить запись
          })
        };
      }
    }
  })
}, 1000 * 10);

vk.updates.start().catch(console.error);
//VK END


function AddToLowDB(body, res) {
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
    res.send({
      "message": "Новое событие записано в базу данных"
    });
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
    if (!results[0]) {
      connection.query('INSERT INTO usres_vk SET ?', vk_id, (error, results, fields) => {
        if (error) {
          console.error('An error occurred while executing the query')
          throw error
        }
      })
    }
  })
}
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.jsonp());
server.use(restify.plugins.bodyParser({
  mapParams: true
}));

server.post('/buy', function (req, res) {
  AddToLowDB(req.body, res)
});
server.post('/imp', function (req, res) {
  AddToLowDB(req.body, res)
});
server.post('/powder', function (req, res) {
  AddToLowDB(req.body, res)
});
server.post('/upgr', function (req, res) {
  AddToLowDB(req.body, res)
});

server.listen(1984, function () {
  console.log('%s listening at %s', server.name, server.url);
});