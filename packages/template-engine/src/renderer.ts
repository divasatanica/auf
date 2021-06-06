import { IToken, IDataPropInfo, IIterationItem, IConditionItem } from './type';
import {
  TYPE_TOKEN_CONDITION,
  TYPE_TOKEN_DATA_PROP,
  TYPE_TOKEN_ITERATION,
  TYPE_TOKEN_NORMAL,
  TYPE_CONDITION_ITEM_ELSE,
  TYPE_CONDITION_ITEM_ELSEIF,
  TYPE_CONDITION_ITEM_IF
} from './parser';

const globalKeySymbol = Symbol('$$global');

function renderCondition(conditionItems: IConditionItem[], data) {
  const functionBody = conditionItems.map(item => {
    const { condition, type, result } = item;
    switch(type) {
      case TYPE_CONDITION_ITEM_IF: {
        return `if(${condition}){return '${renderDataProp(result, data)}'}`;
      }
      case TYPE_CONDITION_ITEM_ELSEIF: {
        return `else if(${condition}){return '${renderDataProp(result, data)}'}`;
      }
      case TYPE_CONDITION_ITEM_ELSE: {
        return `else {return '${renderDataProp(result, data)}'}`;
      }
      default: {
        return '';
      }
    }
  });
  const fn = new Function(functionBody.join(''));

  // Use data as this in fn function and invoke it to get the result.
  const result = fn.call(data);

  return result;
}

function renderIteration(token: IIterationItem, data: any) {
  const { scope, template } = token;
  let iterated = data;
  scope.forEach(key => {
    if (key === 'this') {
      return;
    }

    iterated = iterated[key];
  });
  const res = [] as any[];

  iterated.forEach(item => {
    if (typeof template === 'string') {
      res.push(template);
      return;
    }

    const result = renderIterationItem(template, item, data);

    res.push(result);
  })

  return res;
}

function renderIterationItem(info: IDataPropInfo, data: any, globalData: any) {
  const finalData = {
    ...data,
    [globalKeySymbol]: globalData
  };

  return renderDataProp(info, finalData);
}

function renderDataProp(token: IDataPropInfo, data: any) {
  let { props, template } = token;
  let res = template;
  props.forEach(prop => {
    const { propPath, match } = prop;
    let _data = data;
    propPath.forEach(key => {
      // Accessing with the keyword 'this' means access global data
      // so we should replace the key with the built-in global access key Symbol($$global)
      let _key = key as (string | symbol);
      if (key === 'this') {
        _key = globalKeySymbol;
      }
      _data = _data[_key];
    });
    res = res.replace(match, _data);
  })

  return res;
}

export function render(tokens: IToken[], data: any) {
  const out = [] as any[];

  tokens.forEach(tokenItem => {
    const { token, type } = tokenItem

    switch (type) {
      case TYPE_TOKEN_NORMAL: {
        out.push(token as string);
        break;
      }

      case TYPE_TOKEN_ITERATION: {
        const result = renderIteration(token as IIterationItem, data);

        out.push(...result);
        break;
      }

      case TYPE_TOKEN_DATA_PROP: {
        // To reuse the logic in renderDataProp
        // set a property names Symbol($$global) in data
        const result = renderDataProp(token as IDataPropInfo, { [globalKeySymbol]: data });

        out.push(result);
        break;
      }

      case TYPE_TOKEN_CONDITION: {
        const result = renderCondition(token as IConditionItem[], data);

        out.push(result);
        break;
      }

      default: {
        out.push(token);
      }
    }
  })

  return out;
}