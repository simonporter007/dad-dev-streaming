import React from "react";
import { Timer } from "./Timer";
import { TomatoSvg } from "./TomatoSvg";

export function PomodoroTimer() {
  return (
    <div className="grid justify-end py-4 px-2 h-fit">
      <div className="bg-gradient p-4 rounded-lg min-w-[250px] transition-opacity ease-in-out duration-1000">
        <TomatoSvg />
        <Timer />
      </div>
    </div>
  );
}
