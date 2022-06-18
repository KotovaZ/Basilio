import Layer from "./layer";
import {Text} from "./components/text/text";
import {connector, store} from "./state";

@connector('framerate', 'health', 'lifes', 'score', 'time')
export class MenuLayer {
    private layer: Layer;

    constructor() {
        this.layer = new Layer(9999, {});
        this.layer.addObject(
                new Text({
                    x: 3 * 32,
                    y: 2 * 32,
                }, {text: 'SCORE'})
            )
            .addObject(
                new Text({
                    x: 3 * 32,
                    y: 3 * 32,
                }, store.tieUp({text: 'score', style: {fillStyle: 'white'}}))
            )
            .addObject(
                new Text({
                    x: 30 * 32,
                    y: 2 * 32,
                }, {text: 'WORLD'})
            )
            .addObject(
                new Text({
                    x: 30.5 * 32,
                    y: 3 * 32,
                }, {text: '1 - 1'})
            )
            .addObject(
                new Text({
                    x: 35 * 32,
                    y: 2 * 32,
                }, {text: 'FRAMERATE'})
            )
            .addObject(
                new Text({
                    x: 35.25 * 32,
                    y: 3 * 32,
                }, store.tieUp({text: 'framerate', style: {fillStyle: '#ff0000'}})
            );
    }

    public getLayer() {
        return this.layer;
    }

}