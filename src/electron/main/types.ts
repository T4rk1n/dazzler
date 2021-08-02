/* eslint-disable @typescript-eslint/no-unused-vars */
type WindowSize = {
    height?: number;
    width?: number;
    fullscreen?: boolean;
};
type PageWindow = {
    url: string;
    title: string;
    name: string;
    window_options?: WindowOptions;
};
type ElectronConfig = {
    windows: PageWindow[];
    save_window_size: boolean;
    window_size: WindowSize;
};

type CreatePageWindowOptions = {
    save_window_size: boolean;
    window_size: WindowSize;
};

type WindowOptions = WindowSize & {
    center?: boolean;
    resizable?: boolean;
    minimizable?: boolean;
    maximizable?: boolean;
    skipTaskbar?: boolean;
    frame?: boolean;
    opacity?: number;
    transparent?: boolean;
    titleBarStyle?:
        | 'default'
        | 'hidden'
        | 'hiddenInset'
        | 'customButtonsOnHover';
    menuBar?: boolean;
};

type LoadingWindowOptions = WindowOptions & {
    click_through?: boolean;
};
