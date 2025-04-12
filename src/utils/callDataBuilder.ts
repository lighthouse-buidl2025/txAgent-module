import Web3 from 'web3';
const web3 = new Web3();

interface CalldataTemplate {
  method: string;
  inputs: { name: string; type: string }[];
}

export const buildCallData = (
  template: CalldataTemplate,
  params: Record<string, any>
): string => {
  const values = template.inputs.map(i => {
    const val = params[i.name];
    if (val === undefined) throw new Error(`Missing param: ${i.name}`);
    return val;
  });

  return web3.eth.abi.encodeFunctionCall(
    {
      name: template.method,
      type: 'function',
      inputs: template.inputs,
    },
    values
  );
};
