import { requestAPI } from '../handler';

export async function ReadRegisters(data: any, sse: any): Promise<Number[]> {
    var dataToSend = {
        command: 'read',
        sse: sse,
        data: data
    };

    try {
        const reply = await requestAPI<any>('register', {
            body: JSON.stringify(dataToSend),
            method: 'POST'
        });

        let value = reply['data'];
        return Promise.resolve(value);
    } catch (e) {
        console.error(`Error on POST ${dataToSend}.\n${e}`);
        return Promise.reject((e as Error).message);
    }
}

export async function WriteRegisters(
    data: any,
    sse: any
): Promise<string | undefined> {
    var dataToSend = {
        command: 'write',
        sse: sse,
        data: data
    };

    try {
        const reply = await requestAPI<any>('register', {
            body: JSON.stringify(dataToSend),
            method: 'POST'
        });

        if (reply['status'].length !== 0) {
            alert(JSON.stringify(reply['status']));
        }

        let value = reply['data'];
        return Promise.resolve(value);
    } catch (e) {
        console.error(`Error on POST ${dataToSend}.\n${e}`);
        return Promise.reject((e as Error).message);
    }
}

export async function GetJson(): Promise<string> {
    var dataToSend = {
        command: 'init'
    };

    try {
        const reply = await requestAPI<any>('register', {
            body: JSON.stringify(dataToSend),
            method: 'POST'
        });

        return Promise.resolve(reply);
    } catch (e) {
        console.error(`Error on POST ${dataToSend}.\n${e}`);
        return Promise.reject((e as Error).message);
    }
}

export async function TerminateSSE(): Promise<string | undefined> {
    var dataToSend = {
        command: 'terminate'
    };

    try {
        const reply = await requestAPI<any>('register', {
            body: JSON.stringify(dataToSend),
            method: 'POST'
        });

        return Promise.resolve(reply);
    } catch (e) {
        console.error(`Error on POST ${dataToSend}.\n${e}`);
        return Promise.reject((e as Error).message);
    }
}
