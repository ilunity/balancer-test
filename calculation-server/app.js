const {Kafka} = require('kafkajs');

const kafka = new Kafka({
    clientId: 'calculation-balancer',
    brokers: ['kafka:9092'],
})

const sleep = (miliseconds) => {
    const currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}

const bootstrap = async () => {
    const consumer = kafka.consumer({groupId: 'calculate-group', allowAutoTopicCreation: false})
    await consumer.connect()
    await consumer.subscribe({topic: 'calculate-topic', fromBeginning: true})

    const producer = kafka.producer()
    await producer.connect()

    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            const [id, value] = message.value.toString().split("|");
            const kafkaMessage = `${id}|${value}`

            console.log(message);
            sleep(5000);

            await producer.send({
                topic: 'result-topic',
                messages: [{value: kafkaMessage}],
            })
        },
    });
}

bootstrap();
