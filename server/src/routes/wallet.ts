import { checkWallet, createWallet } from "../models/wallet.ts";

export async function handleWalletAction(action: string, message: any, sendResponse: Function, sendError: Function) {
  try {
    if (action === "Check if a Wallet Exists") {
      const exists = await checkWallet(message.walletId);
      sendResponse({ action: "wallet exists", exists });
    } else if (action === "wallet create") {
      const wallet = await createWallet(message.walletData);
      sendResponse({ action: "wallet created", data: wallet });
    } else {
      sendError({ action: "error", message: "Unknown wallet action" });
    }
  } catch (error) {
    sendError({ action: "error", message: error.message || "Internal error" });
  }
}
