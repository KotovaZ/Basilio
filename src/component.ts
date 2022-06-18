class Component {
    constructor(element, attrs = {}) {
        this.element = document.createElement(element);
        this.setAttributes(attrs);
    }

    getInstance() {
        return this.element;
    }

    setInner(text) {
        this.element.innerHTML = text;
        return this;
    }

    setAttribute(key, value) {
        this.element.setAttribute(key, value);
    }
    
    setAttributes(attrs) {
        Object.keys(attrs).forEach(key => {
            this.setAttribute(key, attrs[key]);
        });
    }

    render(parent) {
        parent.appendChild(this.element);
    }
}

export default Component;