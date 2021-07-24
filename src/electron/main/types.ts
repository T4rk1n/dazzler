declare namespace dazzler_electron {
    type WindowSize = {
        height: number;
        width: number;
        fullscreen: boolean;
    };
    type PageWindow = {
        url: string;
        title: string;
        name: string;
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
}
