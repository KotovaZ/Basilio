import {Unit} from "./components/unit/unit";
import {IText} from "./components/text/text";

class Layer {
    objects: Array<Unit> = [];
    constructor(public code: number, public config: {[key: number]: any}) {

    }

    addObject(obj: Unit | IText) {
        obj.layer = this;
        this.objects.push(obj);
        return this;
    }

    deleteObject(obj: Unit | IText) {
        this.objects = this.objects.filter(item => obj !== item);
    }

    get trackableObjects() {
        return this.objects.filter((element) => element.trackable);
    }
}

export default Layer;