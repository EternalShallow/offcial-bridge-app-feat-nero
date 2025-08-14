import { useAccount } from "wagmi";

export const useEvmAddress = () => {
  return useAccount().address;
};
