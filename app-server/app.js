const express = require('express');
const cors = require('cors');
const uuid = require('uuid');
const {kafkaSetup} = require("./kafka-setup");

const PORT = 5000;
const resultsMap = {};

const bootstrap = async () => {
    const {admin, producer} = await kafkaSetup(resultsMap);

    const app = express();
    app.use(cors());

    app.get('/calculate/:number', async (req, res) => {
        const param = req.params.number;

        const id = uuid.v4();
        resultsMap[id] = {
            status: 'process',
            result: null,
        }

        const kafkaMessage = `${id}|${param}`

        await producer.send({
            topic: 'calculate-topic',
            messages: [{value: kafkaMessage}],
        })

        res.send(id);
    })

    app.get('/result/:id', async (req, res) => {
        const id = req.params.id;

        console.log(id);

        if (!resultsMap[id]) {
            return res.sendStatus(404);
        }

        if (resultsMap[id].status !== 'finish') {
            return res.sendStatus(100);
        }

        res.send(resultsMap[id].result);
    })

    app.get('/info', async (req, res) => {
        const groupsData = await admin.describeGroups(['calculate-group']);
        const topicData = await admin.fetchTopicMetadata({topics: ['calculate-topic']})

        res.send({groupsData, topicData});
    })

    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    })
}

bootstrap();
