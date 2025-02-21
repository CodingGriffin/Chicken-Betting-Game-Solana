import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

const RPC_ENDPOINT = "https://patient-warmhearted-wish.solana-mainnet.quiknode.pro/80b9c694fef67a193ae57392c2af36008a088bc9";

// export const POOL_PUBKEY = "Your Pool Public Key Here";
export const VAULT_PUBKEY = "7hAkzPrPQ9o8zwoYUZpYAHy1MRaSUwLgXd52moNg9Knc";
export const POOL_PUBKEY = 'EwSiSdikusUvn1CFikQ6k1fLciBtmLbLtyB4wpYZTgEh';


const PROGRAM_ID = "9smTpU6GRrLysAZQw65ZmsVkowAm4syEnZ61UA79gSFN";//

const API_URL = "https://solana-backend-nu.vercel.app/api"



const TARIFF = new PublicKey("CNi3gmGK5WdPY6fi28PF4TUqwjMnoSTjStbUv8jpX6ct");/////////////////////

const ADMIN_ADDRESS = new PublicKey("7hAkzPrPQ9o8zwoYUZpYAHy1MRaSUwLgXd52moNg9Knc");

const DECIMALS = new BN(1000_000_000);

export {
  RPC_ENDPOINT,
  PROGRAM_ID,
  ADMIN_ADDRESS,
  DECIMALS,
  TARIFF,
  API_URL
}