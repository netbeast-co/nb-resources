require('dotenv').load() // carga variables de entorno
const DASHBOARD_URL = 'localhost:8000'
process.env.NETBEAST = 'localhost:40123'
var netbeast = require("..")

var should = require('chai').should()
var expect = require('chai').expect
var mqtt = require('mqtt')
var http = require('http')
var request = require('request')
var net = require('net')
var q = require('q')

describe('a suite of tests', function() {
 this.timeout(500);

 it('should take less than 500ms', function(done){
   setTimeout(done, 300);
 });

 it('should take less than 500ms as well', function(done){
   setTimeout(done, 200);
 })
})

describe('MQTT methods', function () {

  var body = 'body'
  var title = 'title'

  it('send error notification to dashboard', function (done) {
    var client = mqtt.connect('ws://' + DASHBOARD_URL)
    client.on('connect', function () {
      client.subscribe('netbeast/push')
      netbeast().error(body, title)
    })

    client.on('message', function (topic, message) {
      message = JSON.parse(message.toString())

      if (message.emphasis === 'error' && message.body === body && message.title === title) {
        done()
      }
    })
  })

  it('send info notification to dashboard', function (done) {
    var client = mqtt.connect('ws://' + DASHBOARD_URL)
    client.on('connect', function () {
      client.subscribe('netbeast/push')
      netbeast().info(body, title)
    })

    client.on('message', function (topic, message) {
      message = JSON.parse(message.toString())

      if (message.emphasis === 'info' && message.body === body && message.title === title) {
        done()
      }
    })
  }),

  it('send success notification to dashboard', function (done) {
    var client = mqtt.connect('ws://' + DASHBOARD_URL)
    client.on('connect', function () {
      client.subscribe('netbeast/push')
      netbeast().success(body, title)
    })

    client.on('message', function (topic, message) {
      message = JSON.parse(message.toString())

      if (message.emphasis === 'success' && message.body === body && message.title === title) {
        done()
      }
    })
  }),

  it('send warning notification to dashboard', function (done) {
    var client = mqtt.connect('ws://' + DASHBOARD_URL)
    client.on('connect', function () {
      client.subscribe('netbeast/push')
      netbeast().warning(body, title)
    })

    client.on('message', function (topic, message) {
      message = JSON.parse(message.toString())

      if (message.emphasis === 'warning' && message.body === body && message.title === title) {
        done()
      }
    })
  })

  it('received notification with method on', function (done) {
    var msg = {power: true, brightness: 99, hue: 200, saturation: 80}
    var client = mqtt.connect('ws://' + process.env.NETBEAST)
    setInterval(function () {
      client.publish('netbeast/topic', JSON.stringify(msg))
      client.end()
    }, 100)

    netbeast('topic').on(function (topic, message) {
      expect(message).to.eql(msg)
      done()
    })
  })
})

describe('Find Method', function () {
  var a = netbeast().find()
  it('return the IP address and the port', function (done) {
    a.then(function (ip, port) {
      if (ip) {
        done()
      }
    })
  })
})

describe('Request methods', function () {

  it('create method', function (done) {
    var resource = {
      app: 'app',
      hook: 'hook'
    }
    netbeast('topic').create(resource)
    .then(function (resp) {
      var received = JSON.parse(resp.body)
      //
      expect(resource).to.eql(received)
      done()
    }).catch(function (err) {
      console.log('Error: ' + err)
    })
  })

  it('delete method', function (done) {
    netbeast('topic').delete()
    .then(function (data) {
      var received = data.body.url.split('topic=')
      expect(data.body.method).to.eql('DELETE')
      expect(received[1]).to.eql('topic')
      done()
    })
  })

  it('groupBy method with delete method', function (done) {
    var args = {app: 'belkin-wemo'}
    netbeast('lights').groupBy('colorful').delete(args)
    .then(function (data) {
      var received = data.body.url.split('groupname=')
      var receivedaux = received[1].split('&')
      expect(data.body.method).to.eql('DELETE')
      expect(receivedaux[0]).to.eql('colorful')
      done()
    })
  })

  it('at method with delete method', function (done) {
    var args = {app: 'belkin-wemo'}
    netbeast('lights').at('bedroom').delete(args)
      .then(function (data) {
        var received = data.body.url.split('location=')
        var receivedaux = received[1].split('&')
        expect(data.body.method).to.eql('DELETE')
        expect(receivedaux[0]).to.eql('bedroom')
        done()
      })
  })

  it('Create Custom Scene method', function (done) {
    var newscene = [ {
      id: 1,
      status: {
        power: true,
        brightness: 99,
        hue: 200,
        saturation: 80
      }
    },
      {
        id: 8,
        status: {
          volume: 90,
          track: 'url-track'
        }
      }]
    netbeast('topic').createCustomScene(newscene)
    .then(function (data) {
      for (var i = 0; i < data.length; i++) {
        var received = JSON.parse(data[i].body.body)
        expect(newscene[i]).to.eql(received)
      }
      done()
    })
  })

  it('delete Device Scene method', function (done) {
    netbeast('topic').deleteDeviceScene('id')
    .then(function (data) {
      var received = data.body.url.split('id=')
      var receivedaux = received[1].split('&')
      expect(data.body.method).to.eql('DELETE')
      expect(receivedaux[0]).to.eql('topic')
      expect(received[2]).to.eql('id')
      done()
    })
  })

  it('delete By Id method', function (done) {
    netbeast().deleteById('id')
    .then(function (data) {
      var received = data.body.url.split('id=')
      expect(data.body.method).to.eql('DELETE')
      expect(received[1]).to.eql('id')
      done()
    })
  })

  it('delete Scene method', function (done) {
    netbeast('topic').deleteScene()
    .then(function (data) {
      var received = data.body.url.split('sceneid=')
      expect(data.body.method).to.eql('DELETE')
      expect(received[1]).to.eql('topic')
      done()
    })
  })

  it('groupDevices method', function (done) {
    var ids = [1, 3, 7]
    netbeast().groupDevices('roof', ids)
    .then(function (data) {
      for (var i = 0; i < data.length; i++) {
        var received = data[i].body.url.split('id=')
        expect(ids[i]).to.eql(parseInt(received[1]))
      }
      done()
    })
  })
/*
  it('discoverDevices method', function (done) {
    netbeast().discoverDevices('Sonos')
    .then(function (data) {
      console.log(data)
    })
  })*/
})
/*
describe('Method that specify the location of the objects', function () {

  it('at method', function (done) {
    console.log(netbeast().at('kitchen'))
  })
})
*/
