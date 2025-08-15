const url = require('url');

async function loadEthers() {
  const mod = await import('ethers');
  return mod.ethers ?? mod.default ?? mod;
}

function assertHttps(u) {
  try {
    const p = new url.URL(u);
    if (!/^https?:$/i.test(p.protocol)) {
      throw new Error(`Unsupported RPC protocol: ${p.protocol}`);
    }
  } catch (e) {
    throw new Error(`Invalid RPC URL: "${u}"`);
  }
}

async function makeProvider(rpcUrl) {
  const ethers = await loadEthers();
  return new ethers.JsonRpcProvider(rpcUrl);
}

async function getProvider() {
  const { RPC_URL_PRIMARY, RPC_URL_FALLBACK, CHAIN_ID } = process.env;

  if (!RPC_URL_PRIMARY && !RPC_URL_FALLBACK) {
    throw new Error('No RPC URLs set. Please set RPC_URL_PRIMARY or RPC_URL_FALLBACK in .env');
  }

  const urls = [RPC_URL_PRIMARY, RPC_URL_FALLBACK].filter(Boolean);
  for (const u of urls) assertHttps(u);

  let lastErr = null;
  for (const u of urls) {
    try {
      const p = await makeProvider(u);
      const net = await p.getNetwork();
      if (CHAIN_ID && Number(net.chainId) !== Number(CHAIN_ID)) {
        throw new Error(`ChainId mismatch: got ${Number(net.chainId)} expected ${Number(CHAIN_ID)}`);
      }
      return p; //success request
    } catch (e) {
      lastErr = e;
      console.warn(`[provider] Failed RPC ${u}:`, e.message);
    }
  }
  throw lastErr || new Error('All RPCs failed');
}

module.exports = { getProvider, loadEthers };
