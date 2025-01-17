const {Kafka} = require('kafkajs');

const kafka = new Kafka({
    clientId: 'calculation-balancer',
    brokers: ['kafka:9092'],
})

const kafkaSetup = async (resultsMap) => {
    const admin = kafka.admin()
    await admin.connect()
    const createTopicResult = await admin.createTopics({
        topics: [
            {
                topic: 'calculate-topic',
                numPartitions: 30,
            },
            {
                topic: 'result-topic',
                numPartitions: 1,
            }
        ]
    })

    const topicData = await admin.fetchTopicMetadata({topics: ['calculate-topic']})
    console.log(createTopicResult);
    console.log(topicData.topics[0].partitions.length);

    const producer = kafka.producer();
    await producer.connect();

    const consumer = kafka.consumer({groupId: 'result-group'});
    await consumer.connect();
    await consumer.subscribe({topic: 'result-topic', fromBeginning: true});


    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            const [id, result] = message.value.toString().split("|");

            if (!resultsMap[id]) {
                resultsMap[id] = {};
            }

            resultsMap[id].status = 'finish';
            resultsMap[id].result = result;
        },
    })

    return {admin, producer}
}

module.exports.kafkaSetup = kafkaSetup;
