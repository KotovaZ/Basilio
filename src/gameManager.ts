import Game from "./game";
import Layer from "./layer";
import {Ground} from "./components/ground";
import {Bonus} from "./components/bonus";
import {Mario} from "./components/unit/mario";
import {Crow} from "./components/crow";
import {Decoration} from "./components/decoration";
import {KeyboardController} from "./modules/keyboard/keyboardController";
import {Text} from "./components/text/text";
import {connector} from "./state";
import {MenuLayer, menuLayer} from "./menuLayer";
import {Turtle} from "./components/turtle";

@connector([])
export default class GameManager {
    private level: string;
    private game: Game;
    private keyboardController: KeyboardController;

    constructor(game: Game, keyboardController: KeyboardController) {
        this.game = game;
        this.keyboardController = keyboardController;
        this.keyboardController.addEventHandler(this.controllerEventHandler);
    }

    controllerEventHandler = (event: string, active: boolean) => {
        if (!active) return;
        switch (event) {
            case "PAUSE":
                if (!this.game.paused)
                    this.game.pause();
                else
                    this.game.start();
                break;
            default:
                break;
        }
    }

    public reload(): void {
        this.game.layers = [];
        this.game.clearScene();
        this.game.clearFrame();
        setTimeout(() => this.loadLevel(this.level), 100);
    }

    public loadLevel(level: string): void {
        this.level = level;
        window.framerate = 0;
        window.camera = {x: 640, y: 384};

        const layers = level.split('>');
        layers.reverse().forEach((layer_text, layer_code) => {
            const rows = layer_text.split('\r\n').reverse();
            if (rows.length <= 1) return;

            const layerConfig = JSON.parse(rows.splice(0,2)[1]);
            const layer = new Layer(layer_code, layerConfig);
            this.game.layers.push(layer);
            rows.forEach((row, y) => {
                y += -1
                if (row.length === 0) return;
                row.split('').forEach((symbol, x) => {
                    switch (symbol) {
                        case 'g':
                        case 'b':
                        case 'B':
                        case 'd':
                            layer.addObject(
                                new Ground({
                                    x: x * 32,
                                    y: y * 32,
                                }, 32, 32, symbol)
                            );
                            break;
                        case '?':
                        case '*':
                            layer.addObject(
                                new Bonus({
                                    x: x * 32,
                                    y: y * 32,
                                }, 32, 32, symbol)
                            );
                            break;
                        case 'm':
                            let mario = new Mario(this.keyboardController, {x: x * 32, y: y * 32}, layer);
                            layer.addObject(mario);
                            break;
                        case 'c':
                            let crow = new Crow({x: x * 32, y: y * 32}, 32, 32);
                            layer.addObject(crow);
                            break;
                        case 't':
                            let turtle = new Turtle({x: x * 32, y: y * 32}, 32, 48);
                            layer.addObject(turtle);
                            break;
                        case 'p':
                            layer.addObject(
                                new Ground({
                                    x: x * 32,
                                    y: y * 32,
                                }, 64, 32, symbol)
                            );
                            break;
                        case 'P':
                            layer.addObject(
                                new Ground({
                                    x: x * 32,
                                    y: y * 32,
                                }, 64, 32, symbol)
                            );
                            break;

                        /*case 'p':
                            layer.addObject(
                                new Ground({
                                    x: x * 32,
                                    y: y * 32,
                                }, 32, 0, symbol)
                            );
                            break;*/
                        case 'M':
                            layer.addObject(
                                new Ground({
                                    x: x * 32,
                                    y: y * 32,
                                }, 96, 32, symbol)
                            );
                            break;
                        case 'S':
                        case 'C':
                            layer.addObject(
                                new Decoration({
                                        x: x * 32,
                                        y: y * 32
                                    },
                                    96, 32, symbol)
                            );

                            break;
                        case 'Z':
                        case 'w':
                        case 'W':
                        case 'f':
                            layer.addObject(
                                new Decoration({
                                        x: x * 32,
                                        y: y * 32
                                    },
                                    32, 32, symbol)
                            );

                            break;
                    }
                })
            })
        })
        const menuLayer = new MenuLayer();
        this.game.layers.push(menuLayer.getLayer());
        this.game.start();
    }
}