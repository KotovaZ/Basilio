export const store = (function() {
    const listeners = {};
    const state = {
        framerate: 0,
        lifes: 3,
        health: 100,
        time: 200,
        score: 0
    }

    function connect(...keys: string[]) {
        const listener = {};
        keys.forEach(key => {
            listener[key] = state[key];
            if (!listeners.hasOwnProperty(key))
                listeners[key] = [];
            listeners[key].push(listener);
        })
        return listener;
    }

    function tieUp(links: { [key: string]: string } ): { [key: string]: string } {
        const props = {};
        Object.keys(links).forEach(key => {
            if (state.hasOwnProperty(links[key])) {
                Object.defineProperty(props, key, {
                    get: () => state[links[key]],
                    enumerable: true
                })
            } else {
                props[key] = links[key];
            }
        });
        return props;
    }

    const getState = () => state;
    const set = (key: string, value: any) => {
        state[key] = value;
        if (listeners.hasOwnProperty(key)) {
            listeners[key].forEach(listener => {
                listener[key] = value;
            })
        }
    };
    const get = (key) => state[key];

    return {getState, set, get, connect, tieUp, state, listeners};
})();

export function connector(...keys: string[]) {
    return function connector<T extends {new(...args: any[]): void}>(target: T) {
        return class extends target {
            constructor(...args) {
                this.state = store.connect(...keys);
                super(...args);
            }
        }
    }
}