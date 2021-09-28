const amqp = require('amqplib/callback_api');

exports.send = (queueName, data) => {
  console.log(queueName);
  amqp.connect(process.env.RABBITMQ_URL, function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = queueName;
      var msg = data;

      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(' [x] Sent %s', msg);
    });
  });
};
