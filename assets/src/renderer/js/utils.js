export function findByXpath(xpath, contextNode = document) {
    const it = document.evaluate(
        xpath,
        contextNode,
        null,
        XPathResult.ANY_TYPE,
        null
    );
    const elements = [];
    let current = it.iterateNext();
    while (current) {
        elements.push(current);
    }
    return elements;
}

export function unready(func) {
    return function() {
        return new Promise(resolve => {
            this.setState({ready: false}, () =>
                resolve(func.apply(this, arguments))
            );
        });
    };
}
