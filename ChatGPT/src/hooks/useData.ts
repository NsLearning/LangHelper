import { useState, useEffect } from 'react';
import { v4 } from 'uuid';

export const safeKey = Symbol('chat-id');

export default function useData(oData: any[]) {
  const [opData, setData] = useState<any[]>([]);

  useEffect(() => {
    opInit(oData);
  }, []);

  const opAdd = (val: any) => {
    const v = [val, ...opData];
    setData(v);
    return v;
  };

  const opInit = (val: any[] = []) => {
    if (!val || !Array.isArray(val)) return;
    const nData = val.map((i) => ({ [safeKey]: v4(), ...i }));
    setData(nData);
  };

  const opRemove = (id: string) => {
    const nData = opData.filter((i) => i[safeKey] !== id);
    setData(nData);
    return nData;
  };

  const opRemoveItems = (ids: string[]) => {
    const nData = opData.filter((i) => !ids.includes(i[safeKey]));
    setData(nData);
    return nData;
  };

  const opReplace = (id: string, data: any) => {
    const nData = [...opData];
    const idx = opData.findIndex((v) => v[safeKey] === id);
    nData[idx] = data;
    setData(nData);
    return nData;
  };

  const opReplaceItems = (ids: string[], data: any) => {
    const nData = [...opData];
    let count = 0;
    for (let i = 0; i < nData.length; i++) {
      const v = nData[i];
      if (ids.includes(v[safeKey])) {
        count++;
        nData[i] = { ...v, ...data };
      }
      if (count === ids.length) break;
    }
    setData(nData);
    return nData;
  };

  return {
    opSafeKey: safeKey,
    opInit,
    opReplace,
    opAdd,
    opRemove,
    opRemoveItems,
    opData,
    opReplaceItems,
  };
}
