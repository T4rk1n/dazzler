/* eslint-disable @typescript-eslint/no-unused-vars */

export type WindowSize = {
    height?: number;
    width?: number;
    fullscreen?: boolean;
};
export type WindowStatus = WindowSize & {
    x?: number;
    y?: number;
    resizable?: boolean;
    minimized?: boolean;
    minimizable?: boolean;
    maximized?: boolean;
    maximizable?: boolean;
    movable?: boolean;
    closable?: boolean;
    focus?: boolean;
};
export type PageWindow = {
    url: string;
    title: string;
    name: string;
    window_options?: WindowOptions;
};
export type ElectronConfig = {
    windows: PageWindow[];
    save_window_size: boolean;
    window_size: WindowSize;
};
export type CreatePageWindowOptions = {
    save_window_size: boolean;
    window_size: WindowSize;
};
export type WindowOptions = WindowStatus & {
    center?: boolean;
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
export type LoadingWindowOptions = WindowOptions & {
    click_through?: boolean;
};
