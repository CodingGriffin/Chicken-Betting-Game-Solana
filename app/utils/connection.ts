import { Connection, PublicKey, clusterApiUrl, Commitment, ConfirmOptions } from "@solana/web3.js";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import idl from "../idl/contract.json";

const programID = new PublicKey("9smTpU6GRrLysAZQw65ZmsVkowAm4syEnZ61UA79gSFN"); // Replace with your deployed program ID
const network = clusterApiUrl("devnet"); // Change to "mainnet-beta" for production
const opts = {
  preflightCommitment: "processed",
};

const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment as Commitment);
  const provider = new AnchorProvider(connection, window.solana, opts as ConfirmOptions);
  return provider;
};


export { getProvider, programID };
