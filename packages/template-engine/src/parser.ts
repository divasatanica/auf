import { EventEmitter } from 'events';
import { IDataPropInfo, IIterationItem } from './type';

const dslReg = /\<%(.+)\%\>/;
const dataReg = /{{([\$|\w|\s|\.])+}}/g;
const descReg = /^<!--/;
const descEndReg = /-->$/;
const iterationReg = /for\s?{{([\w|\s]+)}}\s?in\s?{{([\w|\s|\.]+)}}\s?=>\s?(.+)/;
const conditionIfReg = /^if\s?{{(.+)}}\s?=>\s?(.+)/;
const conditionElseIfReg = /elif\s?{{(.+)}}\s?=>\s?(.+)/;
const conditionElseReg = /else\s?=>\s?(.+)/;
const conditionEndIfReg = /endif/;
const TYPE_TOKEN_NORMAL = Symbol('tokenNomrl');
const TYPE_TOKEN_DATA_PROP = Symbol('tokenDataProp');
const TYPE_TOKEN_ITERATION = Symbol('tokenIteration');
const TYPE_TOKEN_CONDITION = Symbol('tokenCondition');
const TYPE_CONDITION_ITEM_IF = Symbol('conditionItemIf');
const TYPE_CONDITION_ITEM_ELSEIF = Symbol('conditionItemElseIf');
const TYPE_CONDITION_ITEM_ELSE = Symbol('conditionItemElse');

const TYPE_DATA_PROP_INFO = Symbol('dataPropInfo');
const TYPE_ITERATION_ITEM = Symbol('iterationItem');

export const EVENT_TOKEN_GENERATED = 'tokenGenerated';
export const EVENT_PARSING_END = 'parsingEnd';

export class Parser extends EventEmitter {
  constructor() {
    super();
  }

  parseTemplate(template: string) {
    let conditionChunks = [] as any[];
    let descChunks = [] as any[];
  
    const templates = template.split('\n');
    for (let i = 0, len = templates.length; i < len; i ++) {
      const chunk = templates[i].trim();
      let _chunk = chunk.trim();
      if (descChunks.length > 0) {
        if (checkDescEnd(_chunk)) {
          descChunks = [];
        }
        continue;
      }
      if (!dslReg.test(_chunk)) {
        this.emit(EVENT_TOKEN_GENERATED, {
          token: _chunk,
          type: TYPE_TOKEN_NORMAL
        });
        continue;
      } else if (checkDescStart(chunk)) {
        // Case for single line description.
        if (checkDescEnd(chunk)) {
          descChunks = [];
          continue;
        }
        descChunks.push(chunk);
        continue;
      } else if (checkDescEnd(chunk)) {
        throw new Error('Unexpected end of description');
      }
  
      _chunk = _chunk.match(dslReg)![1].trim();
  
      switch (true) {
  
        case (checkIfBlock(_chunk)): {
          if (conditionChunks.length > 0) {
            // Case for processing last condition block without any 'else'
            this.emit(EVENT_TOKEN_GENERATED, {
              token: conditionChunks,
              type: TYPE_TOKEN_CONDITION
            });
            conditionChunks = [];
          }
          const startIfMatch = _chunk.match(conditionIfReg);
          if (startIfMatch) {
            const conditionItem = {
              condition: startIfMatch[1].trim(),
              result: parseDataProp(startIfMatch[2].trim()),
              type: TYPE_CONDITION_ITEM_IF
            };
            conditionChunks.push(conditionItem);
          }
          break;
        }
  
        case (checkElseIfBlock(_chunk)): {
          if (conditionChunks.length === 0) {
            throw new Error(`Unmatched elif statement at line ${i + 1}`);
          }
          const elseIfMatch = _chunk.match(conditionElseIfReg);
          if (elseIfMatch) {
            const conditionItem = {
              condition: elseIfMatch[1].trim(),
              result: parseDataProp(elseIfMatch[2].trim()),
              type: TYPE_CONDITION_ITEM_ELSEIF
            };
      
            conditionChunks.push(conditionItem);
          }
          break;
        }
  
        case (checkElseBlock(_chunk)): {
          if (conditionChunks.length === 0) {
            throw new Error(`Unmatched else statement at line ${i + 1}`);
          }
  
          const elseMatch = _chunk.match(conditionElseReg);
          if (elseMatch) {
            const conditionItem = {
              condition: '',
              result: parseDataProp(elseMatch[1].trim()),
              type: TYPE_CONDITION_ITEM_ELSE
            };
            conditionChunks.push(conditionItem);
          }
          break;
        }
  
        case (checkEndIfBlock(_chunk)): {
          if (conditionChunks.length === 0) {
            throw new Error(`Unmatched endif statement at line ${i + 1}`);
          }
          this.emit(EVENT_TOKEN_GENERATED, {
            token: conditionChunks,
            type: TYPE_TOKEN_CONDITION
          });
          conditionChunks = [];
          break;
        }
  
        case (checkIteration(_chunk)): {
          this.emit(EVENT_TOKEN_GENERATED, {
            token: parseIteration(_chunk),
            type: TYPE_TOKEN_ITERATION
          });
          break;
        }
  
        case (checkDataProp(_chunk)): {
          this.emit(EVENT_TOKEN_GENERATED, {
            token: parseDataProp(_chunk),
            type: TYPE_TOKEN_DATA_PROP
          });
          break;
        }
        
        default: {
          this.emit(EVENT_TOKEN_GENERATED, {
            token: _chunk,
            type: TYPE_TOKEN_NORMAL
          });
        }
      }
    }

    this.emit(EVENT_PARSING_END);
  }
}

function checkDescStart(chunk: string) {
  return descReg.test(chunk);
}

function checkDescEnd(chunk: string) {
  return descEndReg.test(chunk);
}

function checkIfBlock(chunk: string) {
  return conditionIfReg.test(chunk);
}

function checkElseIfBlock(chunk: string) {
  return conditionElseIfReg.test(chunk);
}

function checkElseBlock(chunk: string) {
  return conditionElseReg.test(chunk);
}

function checkEndIfBlock(chunk: string) {
  return conditionEndIfReg.test(chunk);
}

function checkDataProp(chunk: string) {
  return dataReg.test(chunk);
}

function checkIteration(chunk: string) {
  return iterationReg.test(chunk);
}

function parseDataProp(chunk: string): IDataPropInfo {
  const dataMatch = chunk.match(dataReg);
  const props = dataMatch!.map(match => {
    const _match = match.replace(/[\s|\{|\}]/g, '');
    const isGlobal = _match.indexOf('this.') > -1;
    const propPath = _match.split('.').slice(isGlobal ? 0 : 1);
    
    return {
      propPath,
      match
    }
  })

  return {
    template: chunk,
    props,
    type: TYPE_DATA_PROP_INFO
  };
}

function parseIteration(chunk: string): IIterationItem {
  let template: any;
  const [itemName, scope, outputTemplate] = chunk.match(iterationReg)!.slice(1);

  if (dataReg.test(outputTemplate)) {
    template = parseDataProp(outputTemplate);
  } else {
    template = outputTemplate;
  }
  
  return {
    itemName,
    // Split the scope string by dot to handle the case like 'xx.xx'
    scope: scope.trim().split('.'),
    template
  }
}

export function isDataPropInfo(v: any): v is IDataPropInfo {
  return v.type === TYPE_DATA_PROP_INFO;
}

export function isIterationItem(v: any): v is IIterationItem {
  return v.type === TYPE_ITERATION_ITEM;
}

export {
  TYPE_TOKEN_CONDITION,
  TYPE_TOKEN_NORMAL,
  TYPE_TOKEN_ITERATION,
  TYPE_TOKEN_DATA_PROP,
  TYPE_CONDITION_ITEM_IF,
  TYPE_CONDITION_ITEM_ELSEIF,
  TYPE_CONDITION_ITEM_ELSE
}