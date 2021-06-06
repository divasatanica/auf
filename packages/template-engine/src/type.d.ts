export interface IConditionItem {
  condition: string;
  result: IDataPropInfo;
  type: symbol;
}

export interface IIterationItem {
  itemName: string;
  scope: string[];
  template: string | IDataPropInfo;
}

interface IDataPropItem {
  propPath: string[];
  match: string;
}

export interface IDataPropInfo {
  template: string;
  props: IDataPropItem[];
  type: symbol;
}

export interface IToken {
  type: symbol;
  token: string | IConditionItem[] | IDataPropInfo | IIterationItem;
}