import {useState} from 'react'
import {Button, Flex, Spin, Typography} from "antd";
import "axios";
import axios from "axios";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const App = () => {
    const [lastAnswer, setLastAnswer] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // const [id, setId] = useState<string>('');
    const [number] = useState<number>(getRandomInt(1, 10));

    const getRequest = async () => {
        setIsLoading(true);

        const response = await axios.get(`${serverUrl}/calculate/${number}`);
        console.log(response.data)

        if (response.status === 404) {
            setLastAnswer(response.data);
        }

        const id = response.data;
        const interval = setInterval(async () => {
            const response = await axios.get(`${serverUrl}/result/${id}`)

            if (response.status === 100) {
                return;
            }

            if (response.status === 200) {
                setIsLoading(false);
                setLastAnswer(response.data);
            }

            clearInterval(interval);
        }, 3000);
    }

    // useEffect(() => {
    //     if (isLoading) {
    //         const interval = setInterval(async () => {
    //             const response = await axios.get(`${serverUrl}/result/${id}`)
    //
    //             if (response.status === 100) {
    //                 return;
    //             }
    //
    //             if (response.status === 200) {
    //                 setIsLoading(false);
    //                 setLastAnswer(response.data);
    //             }
    //         }, 3000);
    //
    //         return () => clearInterval(interval);
    //     }
    // }, [isLoading, id]);

    return (
        <Flex vertical>
            <Typography>
                {number}
            </Typography>
            {/*            <Typography>
                {id}
            </Typography>*/}
            <Button
                onClick={getRequest}
            >
                Запрос
            </Button>
            <Spin spinning={isLoading}/>
            {lastAnswer}
        </Flex>
    )
}
