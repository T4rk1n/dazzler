type IconPackDict = {
    [name: string]: IconPackType;
};

type IconPackType = {
    url: string;
    name: string;
}

type IconContextType = {
    packs: IconPackDict;
    addPack: (pack: IconPackType) => void;
    isLoaded: (packName: string) => boolean;
}
