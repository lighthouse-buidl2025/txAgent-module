import { RuleModel } from '../models/rule.model';
import { DappModel } from '../models/dapp.model';
import { buildCallData } from '../utils/callDataBuilder';
import { executeOnAccount, getMappedAccount } from './core.service';

export const createAgentRuleService = async (input: any) => {
  const { dappName, method, params, userAddress, extra } = input;
  if (!dappName || !method || !params) throw new Error('Missing required fields');

  const rule = new RuleModel({ dappName, method, params, userAddress, extra });
  await rule.save();
  return rule;
};

export const executeRule = async (rule: any) => {
  const { dappName, method, params, userAddress, extra } = rule;
  const dapp = await DappModel.findOne({ name: dappName, method });
  if (!dapp) throw new Error('Dapp method not found');

  const callData = buildCallData({ method, inputs: dapp.calldataTemplate }, params);
  const agentAddress = await getMappedAccount(userAddress);
  if (!agentAddress) throw new Error('Agent address not found');

  return await executeOnAccount(agentAddress, dapp.address, callData);
};

export const getRulesByUserAddressService = async (userAddress: string) => {
  return await RuleModel.find({ userAddress: userAddress.toLowerCase() });
};
