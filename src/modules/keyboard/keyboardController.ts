import { IKeyboard } from './keyboard';

export interface IKeyboardController {
  keyboard: IKeyboard;
  target: HTMLElement;
  actions: Array<string>;
  addEventHandler: Function;
};

export class KeyboardController implements IKeyboardController {
  keyboard: IKeyboard;
  target: HTMLElement;
  actions: Array<string> = [];
  handler: Array<Function> = [];

  constructor(keyboard: IKeyboard, target: HTMLElement) {
    this.keyboard = keyboard;
    this.target = target;
    this.eventHandler();
  }

  setKeyboard(keyboard: IKeyboard) {
    this.actions = [];
    this.keyboard = keyboard;
  }

  eventHandler = () => {
    this.target.addEventListener("keydown", (event: KeyboardEvent) => {
      if (this.checkEventCode(event.code) && !event.repeat)
        this.addAction(event.code);
    });

    this.target.addEventListener("keyup", (event: KeyboardEvent) => {
      if (this.checkEventCode(event.code))
        this.removeAction(event.code);
    });
  }

  checkEventCode = (action: string) => {
    return this.keyboard.hasOwnProperty(action);
  }

  addAction = (action: string) => {
    if (!this.checkAction(action)) {
      let eventCode = this.getEventCode(action);
      this.actions.push(eventCode);
      this.handler.forEach(handler => handler(eventCode, true));
    }
  }

  checkAction = (action: string) => {
    return this.actions.indexOf(this.keyboard[action]) >= 0;
  }

  getEventCode = (action: string) => {
    return this.keyboard[action];
  }

  removeAction = (action: string) => {
    let eventCode = this.getEventCode(action);
    let actionIndex = this.actions.indexOf(eventCode);
    delete this.actions[actionIndex];
    this.actions = this.actions.filter(() => true);
    this.handler.forEach(handler => handler(eventCode, false));
  }

  addEventHandler = (callback: Function) => {
    this.handler.push(callback);
  }
}