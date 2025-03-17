import { sendResponse, sendError } from "./dht.ts"
import type { MessageInterface } from "../interfaces/message.ts";

import { handleBlockAction } from "../routes/block.ts"
import { handleWalletAction } from "../routes/wallet.ts";

async function handleAction(message: MessageInterface) {  
  switch (message.component) {
    case "block":
      await handleBlockAction(message.action, message, sendResponse, sendError);
      break;

    case "wallet":
      await handleWalletAction(message.action, message, sendResponse, sendError);
      break;

    default:
      console.warn("Unknown action:", message.action);
      sendResponse({ action: "error", message: "Unknown action" });
      break;
  }
}

export { handleAction };
