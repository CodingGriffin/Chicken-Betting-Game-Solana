'use client';
import axios from "@/node_modules/axios/index";
import { ToastContainer, toast  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { JSX, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";

import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl
} from '@solana/web3.js';

import IDL from './idl/contract.json';

import Car from "./components/car";

import * as anchor from '@project-serum/anchor';

import * as crypto from 'crypto'

import {
  Program,
  AnchorProvider,
  setProvider,
  getProvider,
  Idl,
  utils,
  BN,
  Provider,
  web3
} from "@project-serum/anchor";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";


import {
  API_URL,
  PROGRAM_ID,
  ADMIN_ADDRESS,
  DECIMALS,
  TARIFF,
  VAULT_PUBKEY,
  POOL_PUBKEY
} from "./utils/constants";
import Character from "./components/character";

import MovingCar from "./components/movingCar";

import { useGlobalAudioPlayer } from 'react-use-audio-player';

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export type RunningStatus = "running" | "stop" | "failed" | "win";

type PoolDataType = {
  [key: string]: string;
}

export default function Home() {

  const [depositModal, setDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("0");
  const [tariffAmount, setTariffAmount] = useState("0");
  const [tariffDuration, setTariffDuration] = useState("0");
  const [program, setProgram] = useState<Program>();
  const [User, setUser] = useState<PublicKey>();
  const [tariffModal, setTariffModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [status, setStatus] = useState<RunningStatus>("stop");
  const [statusText, setStatusText] = useState<string>("Start Game");
  const [roadId, setRoadId] = useState<number>(0);
  const [movable, setMovable] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<keyof typeof difficultySettings>("easy");
  const [roadStatus, setRoadStatus] = useState<boolean[]>(Array(7).fill(false));
  const [cars, setCars] = useState([]);
  const [poolAddress, setPoolAddress] = useState<string>();
  const [poolData, setPoolData] = useState<PoolDataType>();

  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);

  const wallet = useAnchorWallet();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [transactionType, setTransactionType] = useState("deposit");
  const [token, setToken] = useState();
  const [betBalance, setBetBalance] = useState(0);
  const [winAmount, setWinAmount] = useState(0);
  const [pause, setPause] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  const animationFrameRef = useRef<number>(null);
  const roadIdRef = useRef(roadId);
  const depositRef = useRef<HTMLInputElement>(null);
  const withdrawRef = useRef<HTMLInputElement>(null);
  const roadContainerRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);



  const { load, stop, play } = useGlobalAudioPlayer();


  const difficultySettings = {
    easy: { speed: 10, waitDelay: 1200, baseMultiple: 1.09 },
    medium: { speed: 20, waitDelay: 1200, baseMultiple: 1.2 },
    hard: { speed: 30, waitDelay: 1200, baseMultiple: 1.5 },
    nightmare: { speed: 40, waitDelay: 1000, baseMultiple: 2.0 },
  };

  const updateStatus = () => {
    setStatus("failed");
  }

  const openDepositModal = () => {
    setTransactionType("deposit");
    setIsDepositOpen(true);
    onOpen()
  }

  const handleDeposit = async () => {
    const depositAmount = depositRef.current ? depositRef.current.value : '0'
    
    // const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
    //   params: {
    //     ids: 'solana',
    //     vs_currencies: 'usd',
    //   },
    // });

    // const priceInUsd = response.data.solana.usd;

    if (balance !== null) {
      if (parseFloat(depositAmount) >= balance) {
        console.log("Invalid amount");
        return;
      }
      // const lamports = parseFloat(depositRef.current.value) * 1e9 / priceInUsd;

      if (!publicKey) {
        console.error('Wallet is not connected!');
        return;
      }

      const recipient = new PublicKey('8NgZRQgU3owjTwxVd8vd1m1cAK68hNDqRMKi8B7KaC4L');

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: parseFloat(depositAmount) * 1e9,
        })
      );

      try {
        // Send the transaction
        const signature = await sendTransaction(transaction, connection);
        console.log('Transaction signature:', signature);

        console.log(process.env.API_URL)
        const response = await axios.post(
          `${API_URL}/deposit`, 
          {
            signature: signature,
            amount: depositAmount
          },
          {
            headers: {
              'Authorization': `${token}`,  
              'Content-Type': 'application/json',   
            }
          }
          
        );

        if (response.status === 200) {
          toast.success('Deposit success!', {
            position: "top-right",
            autoClose: 3000, // Time in ms before toast disappears
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setBetBalance( (betBalance ?? 0) + parseFloat(depositAmount))
        } else {
          toast.success('Deposit failed!', {
            position: "top-right",
            autoClose: 3000, // Time in ms before toast disappears
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
          
        console.log(response.data);
      } catch (error) {
        console.error('Error sending transaction:', error);
      }
    }
  }

  const openWithdrawModal = () => {
    setTransactionType("withdraw");
    setIsWithdrawOpen(true);
    onOpen()
  }

  const handleWithdraw = async () => {
    const withdrawAmount = withdrawRef.current ? withdrawRef.current.value : '0'

    if (betBalance) {
      if (parseFloat(withdrawAmount) >= betBalance) {
        toast.error('Withdrawal request exceeds balance!', {
          position: "top-right",
          autoClose: 3000, // Time in ms before toast disappears
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        console.log("Invalid amount");
        return;
      }
      // const lamports = parseFloat(depositRef.current.value) * 1e9 / priceInUsd;
      
      const response = await axios.post(
        `${API_URL}/withdraw`, 
        {
          amount: withdrawAmount
        },
        {
          headers: {
            'Authorization': `${token}`,  
            'Content-Type': 'application/json',   
          }
        }
      );

      if (response.status === 200) {
        toast.success('Withdrawal successful!', {
          position: "top-right",
          autoClose: 3000, // Time in ms before toast disappears
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
  
        setBetBalance(betBalance - parseFloat(withdrawAmount))
      }
    }
  }

  const updateCarPosition = (road: number, carPosition: number) => {
    const currentRoadId = roadIdRef.current;
    if (road + 1 === currentRoadId) {
      if (carPosition > 215 && carPosition < 365) {
        setStatus("failed")
      }
    }
  }

  const handleDifficulty = (difficulty: keyof typeof difficultySettings) => {
    if (status === "stop") {
      setDifficulty(difficulty)
    }
  }

  function generateCar(speed: number, road: HTMLElement) {
    new Car(speed, road, updateStatus, updateCarPosition)
  }

  const movingCars = () => {
    const roads = document.querySelectorAll('.road');

    for (const road of roads) {
        const { speed, waitDelay } = difficultySettings[difficulty];
        let roadElement = road as HTMLElement;

        if (roadElement.dataset.index && roadId <  parseInt(roadElement.dataset.index)) {
          if (roadElement.dataset.car === 'false') {
            roadElement.dataset.car = 'true';
            const randomDelay = (Math.random() * waitDelay);

            setTimeout(() => generateCar(speed, roadElement), randomDelay);
          }
        }

        if (roadElement.dataset.index && roadId === parseInt(roadElement.dataset.index)) {
          const randomNumber = Math.random();
          let winLoseRate = 0;
          if (difficulty === "easy")
            winLoseRate = 0.3;
          else if (difficulty === "medium")
            winLoseRate = 0.5;
          else if (difficulty === "hard")
            winLoseRate = 0.7;
          else if (difficulty === "nightmare")
            winLoseRate = 0.85;

          // if (randomNumber < winLoseRate) {
          //   roadElement.dataset.car = 'true';
          //   setTimeout(() => generateCar(speed, roadElement), 10);
          // }
          
        }
    }

    animationFrameRef.current = requestAnimationFrame(() => movingCars()); // Loop animation
  };

  const winLossCar = (winning: boolean) => {
    console.log("win loss car")
    const roads = document.querySelectorAll('.road');

    for (const road of roads) {
        const { speed, waitDelay } = difficultySettings[difficulty];
        let roadElement = road as HTMLElement;

        // if (roadElement.dataset.index && roadId <  parseInt(roadElement.dataset.index)) {
        //   if (roadElement.dataset.car === 'false') {
        //     roadElement.dataset.car = 'true';
        //     const randomDelay = (Math.random() * (2.1 - 1) + 1) * waitDelay;

        //     setTimeout(() => generateCar(speed, roadElement), randomDelay);
        //   }
        // }

        if (roadElement.dataset.index && (roadId) === parseInt(roadElement.dataset.index)) {
          
          if (!winning) {
            roadElement.dataset.car = 'true';
            generateCar(speed, roadElement);
            setStatus("failed")
          }
          
        }
    }

    // animationFrameRef.current = requestAnimationFrame(() => winLossCar()); 
  }

  useEffect(() => {
    load('/music-background.mp3', {
      autoplay: true,
      loop: true
    });

    play();
  }, [])

  // const canplayEvent = async () => {
  //   if (audioRef.current) {
  //     await audioRef.current.play();
  //   }
  // }

  useEffect(() => {
    console.log(roadId)
    movingCars();
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current)
    };
  }, [difficulty, roadId]);

  useEffect(() => {
    const generate = async (address: string) => {
      try {
        console.log(address)
        const response = await axios.post(`${API_URL}/init`, {
          walletAddress: address,
        });

        setToken(response.data.token);
        setBetBalance(response.data.betBalance);
      } catch (error) {
        console.error('Error calling Express API:', error);
      }
    };

    if (wallet) {
      console.log("wallet address", wallet);
      if (publicKey)
        generate(publicKey.toBase58());
    }
    
  }, [wallet, poolData])

  useEffect(() => {
    roadIdRef.current = roadId;
    
    // movingCars();
  }, [roadId]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;

      try {
        const lamports = await connection.getBalance(new PublicKey(publicKey));

        // const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        //   params: {
        //     ids: 'solana',
        //     vs_currencies: 'usd',
        //   },
        // });

        // const priceInUsd = response.data.solana.usd;
        console.log("balance", lamports);
        setBalance(lamports / 1e9); // Convert lamports to SOL
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };

    if (connected) {
      fetchBalance();
    }
  }, [publicKey, connected, connection]);
 
  useEffect(() => {
    if (wallet) {
      console.log(wallet);
      (async function () {
        let provider: Provider;
        try {
          provider = getProvider();
        } catch {
          provider = new AnchorProvider(connection, wallet, {});
          setProvider(provider);
        }

        try {
          const program = new Program(IDL as Idl, PROGRAM_ID);
          setProgram(program);

          const [poolPda, nonce] = anchor.web3.PublicKey.findProgramAddressSync(
              [Buffer.from("pool-seed")],  // Custom seed for uniqueness
              program.programId            // Your program ID
          );

          console.log("poolPda", poolPda.toBase58())

          const [walletUser] = await PublicKey.findProgramAddress(
            [
              Buffer.from(utils.bytes.utf8.encode("lpuser")),
              wallet.publicKey.toBuffer(),
            ],
            program.programId
          );

          setUser(walletUser);

        } catch (err) { }
      })();
    } else {

    }
  }, [wallet]);

  useEffect(() => {
    console.log(status)
    if (status === "failed") {
      setWinAmount(0);
      setStatusText("Restart");
    }
     
  }, [status])

  useEffect(() => {
    if (movable) {
      setWinAmount(betAmount * (difficultySettings[difficulty]["baseMultiple"] * Math.pow(1.15, roadId)))
    }
  }, [movable])

  const handleChangeBetAmout = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(parseFloat(e.target.value));
  }

  const handleMusic = () => {
    setPause(!pause)
    if (!pause) {
      stop();
    } else {
      play()
    }
      
  }

  const updateBalance = async (amount: number) => {
    try {
      const response = await axios.post(
        `${API_URL}/update`, 
        {
          winAmount: amount
        },
        {
          headers: {
            'Authorization': `${token}`,  
            'Content-Type': 'application/json',   
          }
        }
      );

      console.log(response.data);      
    } catch (error) {
      throw error;
    }
  }

  const handleRunning = async () => {
    if (status === "stop") {
      
      if (betBalance) {
        if (betAmount > betBalance * 1) {
          toast.error('Bet amount is not correct!', {
            position: "top-right",
            autoClose: 3000, // Time in ms before toast disappears
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });

          return;
        }

      }

      setStatus("running");
      setStatusText("Cash out");

      
      try {
        const response = await axios.post(
          `${API_URL}/update`, 
          {
            winAmount: (-1 * betAmount)
          },
          {
            headers: {
              'Authorization': `${token}`,  
              'Content-Type': 'application/json',   
            }
          }
        );  

        setBetBalance(betBalance * 1 - betAmount);

        console.log(response.data);      
      } catch (error) {
        throw error;
      }
      
    } else if (status === "running") {
      setStatus("stop");
      setStatusText("Start Game");
      setRoadId(0);
      setRoadStatus(Array(7).fill(false));
      setBetAmount(0);
      setWinAmount(0);

      if (roadContainerRef.current)
        roadContainerRef.current.scrollLeft = 0;

      setBetBalance(betBalance * 1 + winAmount);

      if (movable) {
        await updateBalance(winAmount);
      }
    } else if (status === "failed") {
      setStatus("stop");
      setStatusText("Start Game");
      setRoadId(0);
      setRoadStatus(Array(7).fill(false));
      // setBetAmount(0);
      setWinAmount(0);
      if (roadContainerRef.current)
      roadContainerRef.current.scrollLeft = 0;
    }
  }

  const handleChangeRoad = (id: number) => {
    if (status !== "running") return;

    setMovable(false);
    if (id !== roadId) return;
    if (betAmount === 0) return;

    if (roadId > 0 && !movable) return;

    const currentStatus = status; 

    setTimeout(() => {
      const randomNumber = Math.random();
      let winLoseRate = 0;
      if (difficulty === "easy")
        winLoseRate = 0.3;
      else if (difficulty === "medium")
        winLoseRate = 0.5;
      else if (difficulty === "hard")
        winLoseRate = 0.7;
      else if (difficulty === "nightmare")
        winLoseRate = 0.85;

      console.log("random Number", randomNumber);

      winLossCar(randomNumber > winLoseRate);

      if (randomNumber < winLoseRate)
        return;

      setMovable(true);
      roadStatus[id] = true;
      setRoadStatus(roadStatus); 

      if (roadId >= 4) {
        roadStatus.push(false);

        if (roadContainerRef.current)
          roadContainerRef.current.scrollLeft = (roadId + 2) * 200;        
      }
    }, 1000);

    setRoadId(id + 1);
  }



  return (
    <>
      {/* <iframe src="/music-background.mp3" allow="autoplay" style={{ display: 'none'}} id="iframeAudio"></iframe>  */}
    {/* <video src="/music-background.mp3" id="audioPlayer" style={{ }} autoPlay loop>
    </video> */}
      <ToastContainer />
      { showAlert ? (<div className="w-full h-full absolute top-0 left-0 flex justify-center items-center z-[10000]">
        <div className="bg-[#ff2500] text-white mx-auto my-auto w-[450px] h-[350px] p-5 relative">
          <span className="w-[20px] h-[20px] absolute right-3 top-3 cursor-pointer" onClick={() => setShowAlert(false)}>
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="#fff" strokeWidth="2"/>
              <path d="M9 9L15 15M15 9L9 15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <h3 className="font-bold text-3xl mb-6">Attention!</h3>
          <p className="text-xl">
            Phantom wallet has FALSELY flagged our page!
            <br/>
            If you’re hesitant because of it we recommend creating a fresh wallet, funding it with the amount you wish to play with and using that wallet to connect.
            <br/>
            Please bear with us while trying to fix this. 
            <br/>
            Happy gaming!
          </p>
        </div>
      </div> ) : null }
      
      <Modal data-transactiontype="deposit" isOpen={isDepositOpen} onOpenChange={onOpenChange} onClose={() => setIsDepositOpen(false)}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Deposit Amount</ModalHeader>
              <ModalBody>
                <div className="input-container">
                  <input
                    data-config="betAmount"
                    name="balance"
                    id="balance"
                    type="number"
                    className="text-xl border-1 w-full p-2"
                    placeholder="0"
                    ref={depositRef}
                  />
                </div>
                
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => {handleDeposit(); setIsDepositOpen(false)}}>
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal data-transactiontype="withdraw" isOpen={isWithdrawOpen} onOpenChange={onOpenChange} onClose={() => setIsWithdrawOpen(false)}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Withdraw Amount</ModalHeader>
              <ModalBody>
                <div className="input-container">
                  <input
                    data-config="betAmount"
                    name="balance"
                    id="balance"
                    type="number"
                    className="text-xl border-1 w-full p-2"
                    placeholder="0"
                    ref={withdrawRef}
                  />
                </div>
                
              </ModalBody>
              <ModalFooter>
               
                <Button color="primary" onPress={() => {handleWithdraw(); setIsWithdrawOpen(false)}}>
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex items-end justify-between pb-4 flex-row gap-1">
        <div className="flex gap-2 items-end">
          {/* <div className="input-field">
            <label>Wallet Balance</label>
            <div className="input-container">
              <div className="text-xl opacity-40">SOL</div>
              {balance &&  <input
                data-config="betAmount"
                name="balance"
                id="balance"
                readOnly
                type="number"
                className="w-52 text-xl"
                placeholder="0"
                value={balance.toFixed(2)?.toString()}
              />}
             
            </div>
          </div> */}
          <div className="input-field">
            <label>Betting Account Balance</label>
            <div className="input-container">
              <div className="text-xl opacity-40">SOL</div>
              {betBalance &&  <input
                data-config="betAmount"
                name="balance"
                id="balance"
                readOnly
                type="number"
                className="w-52 text-xl"
                placeholder="0"
                value={betBalance.toFixed(2)?.toString()}
              />}
             
            </div>
          </div>
          <WalletMultiButtonDynamic />
         
          <div className="loss text-lg transition-all duration-300 opacity-0" id="loss">
            0
          </div>

        </div>
        <div className="flex gap-4">
          <button
            id="deposit-btn"
            className="p-3 bg-green-500 text-white rounded-md"
            onClick={openDepositModal}
          >
            Deposit
          </button>
          <button
            id="withdraw-btn"
            className="p-3 bg-red-500 text-white rounded-md"
            onClick={openWithdrawModal}
          >
            Withdraw
          </button>
        </div>

      </div>
      <div className="game">
        <div className="road-container" ref={roadContainerRef}>
          <Character status={status} roadId={roadId} betAmount={betAmount} baseMultiple={difficultySettings[difficulty]["baseMultiple"]}  />
          <div className="start">
            <img
              src="/images/start.svg"
              alt="start"
              className="h-[519px] object-cover"
            />
          </div>
          {
            roadStatus.map((item, index) => {
              // console.log
              return (
                <div key={`road-${index}`} className="road" data-multiple="1.09" data-index={index} data-car="false" onClick={() => handleChangeRoad(index)}>
                  
                  
                  <div className="tile tile-img">
                  <div className="multiple-container" style={{ top: -100}}>
                    {item ? 
                      <>
                        <img src="/images/brick.svg" className="block" style={{ height: 50 }}/>
                        <img src="/images/star.svg" className="star" />
                      </> :
                      <>
                        <img src="/images/brick.svg" className="block" style={{ height: 50, opacity: 0 }}/>
                        <img src="/images/tile.svg" />
                        <span className="multiple">{(difficultySettings[difficulty]["baseMultiple"] * Math.pow(1.15, index)).toFixed(2)}x</span>
                      </>
                     }
                     </div>
                  
                  </div>
                </div>
              )
              
            })
          }         
           {/* <div className="start"  onClick={() => handleChangeRoad(6)}>
            <img
              src="/images/start.svg"
              alt="start"
              className="h-[519px] object-cover"
            />
          </div> */}
        </div>
      </div>
      <div className="settings-pane">
        <div className="header">
          <div className="tab-bar">
            <div
              data-tab="manual-settings"
              id="manual-tab"
              className="tab-bar-item active"
            >
              Manual
            </div>
            <div
              data-tab="automatic-settings"
              id="automatic-tab"
              className="tab-bar-item"
            >
              Rules
            </div>
          </div>
          <div onClick={() => handleMusic()}>
            {/* <svg
              className="size-6"
              viewBox="0 0 35 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.4">
                <path
                  d="M22.0299 5.08948C22.1152 4.91796 22.2335 4.76492 22.3779 4.6391C22.5224 4.51329 22.6902 4.41717 22.8718 4.35622C23.0534 4.29528 23.2452 4.27072 23.4363 4.28393C23.6274 4.29714 23.8141 4.34788 23.9855 4.43323C26.4188 5.64066 28.4665 7.50368 29.8978 9.81234C31.3291 12.121 32.0872 14.7835 32.0866 17.4999C32.0872 20.2163 31.3291 22.8788 29.8978 25.1875C28.4665 27.4961 26.4188 29.3591 23.9855 30.5666C23.8139 30.6535 23.6267 30.7055 23.4348 30.7198C23.2429 30.734 23.0501 30.7101 22.8675 30.6495C22.6849 30.5889 22.516 30.4927 22.3708 30.3666C22.2255 30.2404 22.1066 30.0867 22.021 29.9144C21.9353 29.7421 21.8846 29.5545 21.8718 29.3625C21.859 29.1706 21.8843 28.9779 21.9463 28.7958C22.0083 28.6136 22.1057 28.4455 22.2329 28.3011C22.3601 28.1568 22.5147 28.039 22.6876 27.9547C24.6347 26.9889 26.2733 25.4983 27.4186 23.6511C28.564 21.8038 29.1705 19.6734 29.1699 17.4999C29.1705 15.3264 28.564 13.196 27.4186 11.3487C26.2733 9.50151 24.6347 8.01095 22.6876 7.04511C22.3416 6.87286 22.0781 6.57027 21.9551 6.20385C21.832 5.83742 21.8595 5.43714 22.0314 5.09094L22.0299 5.08948ZM8.75325 11.6666H5.83659C5.06304 11.6666 4.32117 11.9739 3.77419 12.5208C3.22721 13.0678 2.91992 13.8097 2.91992 14.5832V20.4166C2.91992 21.1901 3.22721 21.932 3.77419 22.479C4.32117 23.0259 5.06304 23.3332 5.83659 23.3332H8.75325L15.1116 28.6314C15.3245 28.8087 15.5835 28.9217 15.8584 28.9572C16.1332 28.9926 16.4124 28.949 16.6634 28.8315C16.9143 28.714 17.1266 28.5274 17.2754 28.2936C17.4241 28.0598 17.5032 27.7885 17.5033 27.5114V7.48844C17.5032 7.21134 17.4241 6.94 17.2754 6.7062C17.1266 6.4724 16.9143 6.28581 16.6634 6.1683C16.4124 6.05078 16.1332 6.00719 15.8584 6.04264C15.5835 6.07808 15.3245 6.1911 15.1116 6.36844L8.75325 11.6666Z"
                  fill="#1D1D21"
                />
                <path
                  d="M24.502 12.2499C24.3871 12.0967 24.2431 11.9676 24.0783 11.87C23.9135 11.7725 23.7311 11.7083 23.5415 11.6812C23.3519 11.6541 23.1589 11.6647 22.9734 11.7122C22.7878 11.7597 22.6135 11.8433 22.4603 11.9582C22.3071 12.0731 22.178 12.2171 22.0804 12.3819C21.9829 12.5467 21.9187 12.7291 21.8916 12.9187C21.8645 13.1082 21.8751 13.3013 21.9226 13.4868C21.9701 13.6723 22.0537 13.8467 22.1686 13.9999C22.9022 14.9755 23.3353 16.1845 23.3353 17.4999C23.3353 18.8153 22.9022 20.0243 22.1686 20.9999C21.9366 21.3093 21.8369 21.6983 21.8916 22.0811C21.9463 22.464 22.1509 22.8095 22.4603 23.0416C22.7697 23.2736 23.1586 23.3733 23.5415 23.3186C23.9244 23.2639 24.2699 23.0593 24.502 22.7499C25.6001 21.2886 26.252 19.4686 26.252 17.4999C26.252 15.5311 25.6001 13.7111 24.502 12.2499Z"
                  fill="#1D1D21"
                />
              </g>
            </svg> */}
            {pause ? <svg fill="#1D1D21" width="800px" height="800px" viewBox="0 0 1920 1920" style={{ width: 24, height: 24}} xmlns="http://www.w3.org/2000/svg">
                <path d="M1129.432 113v1694.148H936.638l-451.773-451.773h-315.45c-92.47 0-167.893-74.498-169.392-166.618L0 1185.96V734.187c0-92.47 74.498-167.892 166.618-169.392l2.797-.022h315.45L936.638 113h192.794Zm-112.943 112.943h-33.093l-418.68 418.68v630.901l418.68 418.68h33.093V225.944Zm823.662 411.78L1920 717.571l-242.372 242.372L1920 1202.428l-79.85 79.85-242.484-242.372-242.372 242.372-79.85-79.85 242.372-242.484-242.371-242.372 79.85-79.85 242.37 242.372 242.486-242.372ZM451.773 677.715H169.415c-30.749 0-55.963 24.796-56.464 55.538l-.008.933v451.773c0 30.86 24.907 55.965 55.542 56.464l.93.008h282.358V677.716Z" fillRule="evenodd"/>
            </svg> : <svg fill="#1D1D21" width="800px" height="800px" style={{ width: 24, height: 24}} viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                <path  d="M1129.432 113v1694.148H936.638l-451.773-451.773h-315.45C76.01 1355.375 0 1279.365 0 1185.96V734.187c0-93.404 76.01-169.414 169.415-169.414h315.45L936.638 113h192.794Zm-112.943 112.943h-33.093l-418.68 418.68v630.901l418.68 418.68h33.093V225.944Zm655.488 135.114C1831.904 521.097 1920 733.77 1920 960.107c0 226.226-88.096 438.898-248.023 598.938l-79.851-79.85c138.694-138.695 214.93-323.018 214.93-519.087 0-196.183-76.236-380.506-214.93-519.2Zm-239.112 239.745c95.663 97.018 148.294 224.644 148.294 359.272s-52.631 262.254-148.294 359.272l-80.529-79.286c74.769-75.785 115.88-175.175 115.88-279.986 0-104.811-41.111-204.201-115.88-279.986Zm-981.092 76.914H169.415c-31.06 0-56.472 25.3-56.472 56.471v451.773c0 31.172 25.412 56.472 56.472 56.472h282.358V677.716Z" fillRule="evenodd"/>
            </svg> }
            
            
          </div>
        </div>
        <div className="tabs">
          <div id="manual-settings" className="tab manual">
            <div className="form">
              <div className="input-field">
                <label>Bet Amount</label>
                <div className="input-container">
                  <div className="text-xl opacity-40">◎</div>
                  <input
                    data-config="betAmount"
                    name="bet-amount"
                    value={betAmount}
                    id="bet-amount"
                    type="number"
                    placeholder="0"
                    onChange={handleChangeBetAmout}
                  />
                  <div
                    data-config="betAmountOption"
                    id="bet-amount-option"
                    className="input-options"
                  >
                    <button data-config-value="half" type="button" id="half" onClick={() => { betAmount && setBetAmount(betAmount / 2)}}>
                      1/2
                    </button>
                    <button data-config-value="double" type="button" id="double" onClick={() => { betBalance && (betAmount && betAmount * 2 <= betBalance) && setBetAmount(betAmount * 2)}}>
                      2x
                    </button>
                    <button data-config-value="max" type="button" id="max" onClick={() => { betBalance && setBetAmount(betBalance)}}>
                      Max
                    </button>
                  </div>
                </div>
              </div>
              <div className="input-field">
                <label>Difficulty</label>
                <div className="input-container">
                  <div
                    data-config="difficulty"
                    id="difficulty"
                    className="input-options"
                  >
                    <button
                      data-config-value="easy"
                      type="button"
                      id="easy"
                      className={difficulty === "easy" ? "active" : ''}
                      onClick={() => { handleDifficulty("easy")}}
                    >
                      Easy
                    </button>
                    <button data-config-value="medium" type="button" id="medium" onClick={() => { handleDifficulty("medium")}} className={difficulty === "medium" ? "active" : ''}>
                      Medium
                    </button>
                    <button data-config-value="hard" type="button" id="hard" onClick={() => { handleDifficulty("hard")}} className={difficulty === "hard" ? "active" : ''}>
                      Hard
                    </button>
                    <button
                      data-config-value="nightmare"
                      type="button"
                      id="nightmare"
                      className={difficulty === "nightmare" ? "active" : ''}
                      onClick={() => { handleDifficulty("nightmare")}}
                    >
                      Nigthmare
                    </button>
                  </div>
                </div>
              </div>
              <div className="input-field">
                <div>Betting less than $0.01 will enter demo mode</div>
                {statusText !== '' && <button type="submit" className="start-button" onClick={handleRunning}>{statusText}</button>}
              </div>
            </div>
          </div>
          <br />
          <div id="automatic-settings" className="tab automatic hidden">
            <div>
              User deposite minimum gamble 30% of deposite amount before
              withdrawal is possible Sould not be too difficult If you do these
              two things, we are finished
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
