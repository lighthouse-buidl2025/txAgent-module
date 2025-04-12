import Web3 from 'web3';
const web3 = new Web3();

interface CalldataTemplate {
  method: string;
  inputs: { name: string; type: string }[];
}

/**
 * ABI 없이 method 이름과 파라미터 이름/타입만으로 calldata 생성
 */
export const buildCallData = (
  template: CalldataTemplate,
  params: Record<string, any> = {}
): string => {
  const types = template.inputs.map(i => i.type);
  const values = template.inputs.map(i => {
    const val = params[i.name];
    if (val === undefined)
      throw new Error(`Missing param: ${i.name}`);
    return val;
  });

  // 파라미터가 없을 경우도 처리
  if (template.inputs.length === 0) {
    return web3.eth.abi.encodeFunctionSignature(template.method + '()');
  }

  return web3.eth.abi.encodeFunctionCall(
    {
      name: template.method,
      type: 'function',
      inputs: template.inputs,
    },
    values
  );
};
