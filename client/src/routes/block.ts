import type { Blockchain } from "../models/blockchain.ts";
import type { MessageInterface } from "../interfaces/message.ts";

export async function handleBlockAction(
  action: string,
  message: any,
  sendResponse: (message: MessageInterface) => void,
  sendError: (error: MessageInterface) => void
) {
  const blockchain: Blockchain = new Blockchain();
  try {
    if (action === "get blockchain") {
      const blockchainResponse = await blockchain.getBlockchain();
      sendResponse({
        component: "blockchain",
        action: "blockchain data",
        objectData: JSON.stringify(blockchainResponse),
      });
    } else {
      sendError({
        component: "blockchain",
        action: "error",
        objectData: "Unknown blockchain action",
      });
    }
  } catch (error: any) {
    sendError({
      component: "blockchain",
      action: "error",
      objectData: error.message || "Internal error",
    });
  }
}
