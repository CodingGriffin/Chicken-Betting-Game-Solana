import { RunningStatus } from "../page";

type CharacterProps = {
  roadId: number;
  betAmount: number;
  status: RunningStatus;
  baseMultiple: number
}
const Character = ({ status, roadId, betAmount, baseMultiple }: CharacterProps) => {
    return (
        <div className="character" id="character" style={{ left: roadId * 200}}>
            <div className="counter">
              <img src="/images/count.svg" alt="" />
              <span id="counter-text" className="counter-text">◎{roadId === 0 ? betAmount : (betAmount * (baseMultiple * Math.pow(1.15, (roadId - 1)))).toFixed(4)}</span>
            </div>
            <img
              className="main-character"
              src={status === "failed" ? "/images/dead.svg" : "/images/character.svg"}
              alt=""
            />
        </div>
    )
}

export default Character;