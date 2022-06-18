import Game from "./game.ts";
import {keyboard} from "./modules/keyboard/keyboard";
import {KeyboardController} from "./modules/keyboard/keyboardController.ts";
import level1 from './level/1.txt';
import CollisionChecker from "./collisionChecker";
import GameManager from "./gameManager";

const keyboardController = new KeyboardController(keyboard, document);
const collisionChecker = new CollisionChecker();
window.game = new Game(collisionChecker);

window.gameManager = new GameManager(window.game, keyboardController);
window.gameManager.loadLevel(level1);
