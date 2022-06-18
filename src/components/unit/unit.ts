import { IBody } from "../body";
import Layer from "../../layer";
import {Position} from "../../entity";

export interface IUnit {
  name: string;
  health: Number;
  speed: Number;
  weight: Number;
  body: IBody;
  position: Position;
  collisions: {
    [key: number]: any
  };
  layer: Layer;
}

export class Unit {
  layer: Layer;
  action: string;
  collisions: {
    [key: number]: any
  } = {};
  eventListeners: {
    [key: string]: Array<(props: any) => void>
  } = {};

  clearCollisions = () : void => {
    this.collisions = {};
  }

  setAction = (action: string) : void => {
    this.action = action;
  }

  setCollision = (direction: number, object: any) => {
    if (!this.collisions.hasOwnProperty(direction))
      this.collisions[direction] = [];
    this.collisions[direction].push(object);
  }

  dispatchEvent = (eventName: string, props: any) => {
    if (this.eventListeners.hasOwnProperty(eventName)) {
      this.eventListeners[eventName].forEach(fn => fn(props));
    }
  }

  addEventListener = (eventName: string, callback: (props: any) => void) => {
    if (!this.eventListeners.hasOwnProperty(eventName)) {
      this.eventListeners[eventName] = [];
    }

    this.eventListeners[eventName].push(callback);
  }
}