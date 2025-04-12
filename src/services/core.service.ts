import { account } from '../config/singer';
import { DappModel } from '../models/dapp.model';
import { web3 } from '../config/web3';
import CoreJson from '../abis/Core.json';
const CoreAbi = CoreJson.abi;
import { buildCallData } from '../utils/callDataBuilder'; // 유틸 함수로 따로 만들자

interface ExecuteTxInput {
  userAddress: string;
  dappAddress: string;
  method: string;
  params: Record<string, any>;
  tokenAddress?: string;       // approve가 필요한 경우
  approveAmount?: string;      // approve가 필요한 경우
}

const coreAddress = process.env.CORE_ADDRESS!;
const coreContract = new web3.eth.Contract(CoreAbi as any, coreAddress);

/**
 * 컨트랙트에 기록된 프록시 주소 조회
 */
export const getMappedAccount = async (userAddress: string): Promise<string> => {
  const normalized = web3.utils.toChecksumAddress(userAddress);
  const mapped: string = await coreContract.methods.accounts(normalized).call();
  return mapped;
};

/**
 * Core 컨트랙트에 createAccount 호출 → 프록시 배포
 * @returns 새로 생성된 프록시 주소
 */
export const createAccountOnChain = async (userAddress: string): Promise<string> => {
  const normalized = web3.utils.toChecksumAddress(userAddress);

  const gas = (await coreContract.methods.createAccount(normalized)
    .estimateGas({ from: account.address })).toString();

  const gasPrice = (await web3.eth.getGasPrice()).toString();

  const receipt = await coreContract.methods.createAccount(normalized).send({
    from: account.address,
    gas,
    gasPrice,
  });

  // 이후 생성된 주소는 on-chain mapping에서 확인 가능
  const agentAddress = await getMappedAccount(normalized);

  if (!agentAddress || agentAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Failed to fetch agent address after creation');
  }

  console.log('✅ Account created:', agentAddress);
  return agentAddress;
};

export const excuteTransaction = async (input: ExecuteTxInput): Promise<string> => {
    const { userAddress, dappAddress, method, params, tokenAddress, approveAmount } = input;
    const agentAddress = await getMappedAccount(userAddress);
    if (!agentAddress) throw new Error('Agent address not found');
  
    const dapp = await DappModel.findOne({ address: dappAddress.toLowerCase(), method });
    if (!dapp) throw new Error('Dapp method template not found');
  
    // ✅ calldata 생성
    const callData = buildCallData({
      method: dapp.method,
      inputs: dapp.calldataTemplate,
    }, params);
  
    // ✅ approve 필요하면 선행 처리
    if (dapp.requiresApproval && tokenAddress && approveAmount) {
      const approveCalldata = buildCallData({
        method: 'approve',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
      }, {
        spender: dappAddress,
        amount: approveAmount,
      });
  
      console.log('⏩ Executing approve');
      await executeOnAccount(agentAddress, tokenAddress, approveCalldata);
    }
  
    // ✅ execute 트랜잭션 호출
    const txHash = await executeOnAccount(agentAddress, dappAddress, callData);
    return txHash;
  };

    /**
 * Core 컨트랙트의 excute 함수 실행 (delegatecall)
 * @param userAddress - 등록된 user address
 * @param targetAddress - 호출할 외부 컨트랙트
 * @param callData - 바이트 형식의 실행 데이터
 */
export const executeOnAccount = async (
    userAddress: string,
    targetAddress: string,
    callData: string
  ): Promise<string> => {
    const normalizedAccount = web3.utils.toChecksumAddress(userAddress);
    const normalizedTarget = web3.utils.toChecksumAddress(targetAddress);
  
    const method = coreContract.methods.excute(
      normalizedAccount,
      normalizedTarget,
      callData
    );
  
    const gas = (await method.estimateGas({ from: account.address })).toString();
    const gasPrice = (await web3.eth.getGasPrice()).toString();
  
    const receipt = await method.send({
      from: account.address,
      gas,
      gasPrice,
    });
  
    console.log('✅ excute() transaction hash:', receipt.transactionHash);
  
    return receipt.transactionHash;
  };