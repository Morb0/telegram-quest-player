import { ActionType } from '../enums/action-type.enum';

export interface BaseAction {
  type: ActionType;
  selector: string;
}

export interface Choice extends BaseAction {
  type: ActionType.Choice;
  text: string;
}

export interface Input extends BaseAction {
  type: ActionType.Input;
}

export type Action = Choice | Input;
