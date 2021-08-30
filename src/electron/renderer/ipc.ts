type Ipc = {
    on: (k: string, handler: any) => void;
    invoke: <T>(k: string) => Promise<T>;
    send: (k: string, payload?: any) => void;
};

// @ts-ignore
const ipc: Ipc = window.ipc;

export default ipc;
