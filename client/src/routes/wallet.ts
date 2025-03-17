import { Wallet } from "../models/wallet.ts";
import { UTXO } from "../models/utxo.ts"
import type { MessageInterface } from "../interfaces/message.ts";

export async function handleWalletAction(
  action: string,
    message: any,
    sendResponse: (message: MessageInterface) => void,
    sendError: (error: MessageInterface) => void
) {
  try {
    const utxo:UTXO = new UTXO();
    const wallet:Wallet = new Wallet(utxo);
    if (action === "Check if a Wallet Exists") {
      const exists = await wallet.checkWallet(message.walletId);
      sendResponse({ 
        component: "wallet",
        action: "wallet exists", 
        objectData: JSON.stringify({exists: exists})
      });
    } else if (action === "wallet create") {
      // const wallet = await Wallet.createWallet(message.walletData);
      sendResponse({ 
        component: "wallet",
        action: "wallet created", 
        objectData: JSON.stringify(wallet) 
      });
    } else {
      sendError({ 
        component: "wallet",
        action: "error", 
        objectData: "Unknown wallet action" 
      });
    }
  } catch (error: any) {
    sendError({ 
      component: "wallet",
      action: "error", 
      objectData: error.message || "Internal error" 
    });
  }
}
