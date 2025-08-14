import { useConnectModal } from "@rainbow-me/rainbowkit";

export function useEvmWalletModal() {
  const { openConnectModal, connectModalOpen } = useConnectModal();

  return {
    isOpen: connectModalOpen,
    open: openConnectModal,
  };
}
