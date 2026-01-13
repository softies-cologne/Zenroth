import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import axios from "axios";
import { createPublicClient, createWalletClient, custom, formatEther, http, isAddress } from "viem";
import { base } from "viem/chains";
import fs from "node:fs";

const NETWORK = {
  name: "Base Mainnet",
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org",
  explorer: "https://basescan.org",
};

function linkAddress(a) {
  return `${NETWORK.explorer}/address/${a}`;
}
function linkBlock(n) {
  return `${NETWORK.explorer}/block/${n}`;
}
function linkCode(a) {
  return `${NETWORK.explorer}/address/${a}#code`;
}
function short(a) {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}
function iso() {
  return new Date().toISOString();
}

function loadTargets() {
  try {
    const raw = fs.readFileSync("samples/targets.json", "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.targets) ? parsed.targets : [];
  } catch {
    return [
      "0x0000000000000000000000000000000000000000",
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222",
    ];
  }
}

async function rpcChainIdHealthcheck() {
  const payload = { jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] };
  const res = await axios.post(NETWORK.rpcUrl, payload, { timeout: 10_000 });
  return res?.data?.result ?? null;
}

function gweiFromWeiBigint(x) {
  const n = Number(x) / 1e9;
  if (!Number.isFinite(n)) return String(x);
  return n.toFixed(3);
}

export async function run() {
  console.log("Built for Base");
  console.log(`Network: ${NETWORK.name}`);
  console.log(`chainId (decimal): ${NETWORK.chainId}`);
  console.log(`Explorer: ${NETWORK.explorer}`);
  console.log(`RPC: ${NETWORK.rpcUrl}`);
  console.log("");

  console.log("RPC quick check:");
  try {
    const chainIdHex = await rpcChainIdHealthcheck();
    console.log(`- eth_chainId: ${chainIdHex ?? "null"}`);
  } catch (e) {
    console.log(`- rpc check failed: ${e?.message || String(e)}`);
  }
  console.log("");

  const sdk = new CoinbaseWalletSDK({
    appName: "Zenroth",
    darkMode: false,
    overrideIsMetaMask: false,
    overrideIsCoinbaseWallet: true,
  });

  const provider = sdk.makeWeb3Provider(NETWORK.rpcUrl, NETWORK.chainId);

  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http(NETWORK.rpcUrl),
  });

  const targets = loadTargets();
  console.log(`Targets loaded: ${targets.length}`);
  console.log("");

  let addresses = [];
  try {
    if (typeof window === "undefined") {
      console.log("Wallet discovery note: Coinbase Wallet connection requires a browser environment.");
      console.log("Continuing with RPC-only reads.");
    } else {
      addresses = await walletClient.getAddresses();
    }
  } catch {
    console.log("Wallet discovery failed, continuing with RPC-only reads.");
  }
  console.log("");

  if (addresses.length) {
    console.log("Balances:");
    for (const a of addresses) {
      const bal = await publicClient.getBalance({ address: a });
      console.log(`- ${short(a)}: ${formatEther(bal)} ETH`);
      console.log(`  ${linkAddress(a)}`);
    }
    console.log("");
  }

  const latest = await publicClient.getBlockNumber();
  const block = await publicClient.getBlock({ blockNumber: latest });
  const gasPrice = await publicClient.getGasPrice();

  console.log("Block and gas:");
  console.log(`- Latest block: ${latest.toString()}`);
  console.log(`  ${linkBlock(latest.toString())}`);
  console.log(`- Timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}`);
  console.log(`- Gas price (gwei approx): ${gweiFromWeiBigint(gasPrice)}`);
  console.log("");

  console.log("Bytecode checks:");
  for (const t of targets) {
    if (!isAddress(t)) {
      console.log(`- invalid address skipped: ${t}`);
      continue;
    }
    const code = await publicClient.getBytecode({ address: t });
    const has = !!code && code !== "0x";
    console.log(`- ${short(t)}: ${has ? "bytecode found" : "no bytecode"}`);
    console.log(`  ${linkCode(t)}`);
  }
  console.log("");

  console.log(`Run complete: ${iso()}`);
}

run().catch((e) => console.error(e));
