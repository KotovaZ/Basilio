function gravity<T extends {new (...args: any[]): {}}>(target: T) {
    return class extends target {
        constructor(...args) {
            this.gravity = true;
            super(...args);
        }
    }
}
export default gravity;