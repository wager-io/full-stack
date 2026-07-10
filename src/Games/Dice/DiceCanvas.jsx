import React from 'react';
import { useDiceGame } from './DiceContext';
import './style.css';
import MultiplierView from './MultiplierView';
import DiceHistory from "./DiceHistory"

const DiceCanvas = () => {
    const { gameState, lastRoll, mode, target, handleTargetChange, showResult } = useDiceGame();

    return (
        <div className="flex-grow relative rounded-lg overflow-hidden p-2">
            <div className="w-full mb-12">
                <DiceHistory />
            </div>
            <div className='relative'>
                <div className="content svelte-1otmwc3 pb-0 md:pb-10">
                    <div className="wrap svelte-1esfxtl bg-gray-800 cursor-pointer" data-test-dice-condition="above" style={{ "--slider-height": "8px", "--drag-size": "36px", "--max-game-board-width": "730px", "--lines-asset": "url(/assets/games/Dice/lines.T9v8Oznt.svg)" }}>
                        <div className="wrap svelte-16rlbb1">
                            <div className="content svelte-16rlbb1" style={{ left: "0%" }}>
                                <div className="value svelte-16rlbb1">0</div>
                            </div>
                            <div className="content svelte-16rlbb1" style={{ left: "25%" }}>
                                <div className="value svelte-16rlbb1">25</div>
                            </div>
                            <div className="content svelte-16rlbb1" style={{ left: "50%" }}>
                                <div className="value svelte-16rlbb1">50</div>
                            </div>
                            <div className="content svelte-16rlbb1" style={{ left: "75%" }}>
                                <div className="value svelte-16rlbb1">75</div>
                            </div>
                            <div className="content svelte-16rlbb1" style={{ left: "100%" }}>
                                <div className="value svelte-16rlbb1">100</div>
                            </div>
                        </div>
                        <div className="content svelte-1esfxtl">
                            <div className="translate-x svelte-zv80zt relative -z-50" style={{ "--dice-slide-transition": "300ms", transform: `translate(${lastRoll?.roll || 50}%, 0px)` }}>
                                <div className={`hide-show neutral flex svelte-zv80zt justify-center items-center ${!lastRoll ? 'opacity-0' : 'opacity-100'}`} style={{ "--dice-scale-transition": "500ms" }}>
                                    <img className="dice svelte-zv80zt w-17" src="/assets/games/Dice/classic-dice.BVpplMR8.svg" alt="Dice" />
                                    {lastRoll && <div className={`result neutral svelte-zv80zt absolute ${lastRoll?.won ? "text-green-600" : "text-red-600"}  bold`} style={{ "--dice-result-transition": "100ms" }}>{lastRoll?.roll}</div>}
                                </div>
                            </div>
                            <div className="range svelte-1esfxtl">
                                <div className={`lower ${mode !== "under" ? "above" : "below"}  svelte-1esfxtl`}></div>
                                <div className={`higher ${mode !== "under" ? "above" : "below"}  svelte-1esfxtl`} style={{ width: target + "%" }}></div>
                            </div>
                            <input min="2" max="98" type="range" value={target}
                                onChange={(e) => handleTargetChange(parseInt(e.target.value))} className="classic-slider svelte-1esfxtl" data-test="dice-slider" />
                        </div>
                    </div>
                </div>
                <MultiplierView />
            </div>


        </div>
    );
};

export default DiceCanvas;