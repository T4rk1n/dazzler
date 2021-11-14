import React from 'react';
export default React.createContext<IconContextType>({
    packs: {},
    addPack: () => null,
    isLoaded: () => false,
});
