// Broker.js is an instance for socket.io
// that logs messages to refactor code

var chalk = require('chalk')

var mqtt = require('mqtt')
var broker = module.exports = {}

// title is optional
broker.info = function (body, title) {
  broker.emit({ emphasis: 'info', body: body, title: title })
}

broker.error = function (body, title) {
  broker.emit({ emphasis: 'error', body: body, title: title })
}

broker.success = function (body, title) {
  broker.emit({ emphasis: 'success', body: body, title: title })
}

broker.warning = function (body, title) {
  broker.emit({ emphasis: 'warning', body: body, title: title })
}

broker.emit = function (msg) {
  // Log notification through console
  var str = chalk.bgCyan('ws') +
  chalk.bold.bgCyan(msg.title || '::')

  switch (msg.emphasis) {
    case 'error':
      str = str + chalk.bgRed(msg.body)
      break
    case 'warning':
      str = str + chalk.bgYellow(msg.body)
      break
    case 'info':
      str = str + chalk.bgBlue(msg.body)
      break
    case 'success':
      str = str + chalk.bgGreen(msg.body)
      break
  }

  var client = mqtt.connect('ws://localhost:8000')
  console.log(str)
  client.publish('netbeast/push', JSON.stringify(msg))
  client.end()
}
