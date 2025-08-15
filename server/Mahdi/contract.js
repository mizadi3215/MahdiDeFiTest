const { getProvider, loadEthers } = require('./provider.js');

const DEFAULT_ERC20 = process.env.TEST_CONTRACT;
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

async function getErc20(address = DEFAULT_ERC20) {
  const ethers = await loadEthers();
  const provider = await getProvider();
  const code = await provider.getCode(address);
  if (code === '0x') {
    throw new Error(`No contract code at ${address} on this network`);
  }
  return { contract: new ethers.Contract(address, ERC20_ABI, provider), provider, ethers };
}

async function readTokenMeta(address) {
  const { contract, provider, ethers } = await getErc20(address);
  const [net, block, name, symbol, decimals, totalSupply] = await Promise.all([
    provider.getNetwork(),
    provider.getBlockNumber(),
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply()
  ]);
  return {
    network: { chainId: Number(net.chainId), name: net.name ?? 'unknown' },
    blockNumber: block,
    token: {
      address,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: totalSupply.toString()
    }
  };
}

async function withSigner() {
  const { PRIVATE_KEY } = process.env;
  if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY not set');
  const ethers = await loadEthers();
  const provider = await getProvider();
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return { ethers, provider, wallet };
}

module.exports = { readTokenMeta, withSigner };
