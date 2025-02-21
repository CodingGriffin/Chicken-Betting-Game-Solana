import React, { Dispatch, SetStateAction } from 'react';
import { RunningStatus } from '../page';

const CAR_IMG: string = "/images/car.svg"; // Replace with your actual image path
class Car {
    speed: number; // Speed of the car
    roadElement: HTMLElement; // The road element to which the car will be appended
    carElement: HTMLImageElement; // The car element itself
    private setStatus: Dispatch<SetStateAction<RunningStatus>>
    private updateCarPosition: (road: number, carPosition: number) => void
  
    constructor(speed: number, roadElement: HTMLElement, setStatus: Dispatch<SetStateAction<RunningStatus>>, updateCarPosition: (road: number, carPosition: number) => void) {
      this.speed = speed;
      this.roadElement = roadElement;
      this.carElement = this.createCarElement();
      this.roadElement.appendChild(this.carElement);

      this.setStatus = setStatus;
      this.updateCarPosition = updateCarPosition

    //   console.log(this.roadElement)
      this.moveCar();
    }
  
    createCarElement(): HTMLImageElement {
      const car = document.createElement("img") as HTMLImageElement;
      car.src = CAR_IMG;
      car.classList.add("car");
      car.style.top = "-50px"; // Start above the road
      car.style.left = "50%"; // Center the car horizontally
      car.style.transform = "translateX(-50%)"; // Center the car horizontally
      return car;
    }
  
    moveCar(): void {
      const roadHeight: number = this.roadElement.clientHeight;
      const carHeight: number = this.carElement.clientHeight;
      const startPosition: number = -carHeight;
      const endPosition: number = roadHeight;
  
      const move = (): void => {
        const currentPosition: number = parseFloat(this.carElement.style.top);

        if (currentPosition < endPosition) {
          this.carElement.style.top = `${currentPosition + this.speed}px`;

        //   console.log("index", parseInt(this.roadElement.dataset.index as string) + 1, parseInt(this.carElement.style.top), this.roadId)

        this.updateCarPosition(parseInt(this.roadElement.dataset.index as string), parseInt(this.carElement.style.top))

          // if (parseInt(this.carElement.style.top) > 43 && this.roadId ===  parseInt(this.roadElement.dataset.index as string) + 1) {
          //   // console.log("index", parseInt(this.roadElement.dataset.index as string) + 1)
            
          //   // this.setStatus("failed");
          //   console.log("crashed", this.roadId, this.roadElement.dataset.index);
          // }
          requestAnimationFrame(move);
        } else {
          this.roadElement.dataset.car = "false";
          this.carElement.remove();
        }
      };
  
      this.carElement.style.top = `${startPosition}px`;
      requestAnimationFrame(move);
    }
  }

  export default Car;