import React, { useState, useEffect } from 'react';
import { Circle, ArrowRight } from 'lucide-react';

interface Coroutine {
  id: number;
  name: string;
  angle: number;
  status: 'running' | 'waiting' | 'completed' | 'awaiting';
  position: {
    x: number;
    y: number;
  };
}

function App() {
  const [step, setStep] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const radius = 180;
  const centerX = 350;
  const centerY = 350;
  const totalSteps = 12; // Complete cycle

  const [coroutines, setCoroutines] = useState<Coroutine[]>([
    { id: 1, name: 'async def task_1()', angle: 0, status: 'waiting', position: { x: centerX + radius, y: centerY } },
    { id: 2, name: 'async def task_2()', angle: 120, status: 'waiting', position: { x: centerX - radius/2, y: centerY + radius * Math.sqrt(3)/2 } },
    { id: 3, name: 'async def task_3()', angle: 240, status: 'waiting', position: { x: centerX - radius/2, y: centerY - radius * Math.sqrt(3)/2 } },
  ]);

  // Continuous rotation effect
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.2) % 360);
    }, 50);

    return () => clearInterval(rotationInterval);
  }, []);

  useEffect(() => {
    setCoroutines((prevCoroutines) => {
      return prevCoroutines.map((coroutine) => {
        const stepInSequence = step % 4;
        let status = coroutine.status;
        let position = { ...coroutine.position };
        const baseAngle = (coroutine.angle + rotationAngle) % 360;
        const basePosition = getCoroutinePosition(baseAngle);

        // Determine coroutine state based on the current step
        if (Math.floor(step / 4) === coroutine.id - 1) {
          switch(stepInSequence) {
            case 0: // Start executing
              status = 'running';
              position = { x: centerX, y: centerY }; // Move to center
              break;
            case 1: // Hit await point
              status = 'awaiting';
              position = { 
                x: centerX + (basePosition.x - centerX) * 0.5,
                y: centerY + (basePosition.y - centerY) * 0.5
              };
              break;
            case 2: // Complete await
              status = 'running';
              position = { x: centerX, y: centerY };
              break;
            case 3: // Complete execution
              status = 'completed';
              position = basePosition;
              break;
          }
        } else {
          // Other coroutines continue rotating
          position = basePosition;
          status = status === 'completed' ? 'completed' : 'waiting';
        }

        return { ...coroutine, position, status };
      });
    });
  }, [step, rotationAngle]);

  const getCoroutinePosition = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-500';
      case 'waiting':
        return 'text-yellow-500';
      case 'completed':
        return 'text-blue-500';
      case 'awaiting':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStepDescription = (step: number) => {
    const taskNumber = Math.floor(step / 4) + 1;
    const phase = step % 4;
    
    switch(phase) {
      case 0:
        return `Task ${taskNumber} starts execution`;
      case 1:
        return `Task ${taskNumber} reaches await point`;
      case 2:
        return `Task ${taskNumber} resumes execution`;
      case 3:
        return `Task ${taskNumber} completes`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Python Asyncio Visualization</h1>
      
      <div className="relative w-[700px] h-[700px]">
        <svg className="absolute inset-0" width="700" height="700">
          {/* Event Loop Circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#4B5563"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          
          {/* Event Loop Label with Arrow */}
          <line
            x1={centerX + radius + 20}
            y1={centerY}
            x2={centerX + radius + 80}
            y2={centerY}
            stroke="#4B5563"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <text
            x={centerX + radius + 90}
            y={centerY + 5}
            className="fill-white text-sm font-mono"
          >
            Event Loop
          </text>

          {/* Await Points */}
          {[0, 120, 240].map((angle) => {
            const rotatedAngle = (angle + rotationAngle) % 360;
            const pos = getCoroutinePosition(rotatedAngle);
            const midX = centerX + (pos.x - centerX) * 0.5;
            const midY = centerY + (pos.y - centerY) * 0.5;
            return (
              <g key={`await-${angle}`}>
                <circle
                  cx={midX}
                  cy={midY}
                  r="4"
                  className="fill-purple-500 opacity-50"
                />
              </g>
            );
          })}

          {/* Coroutines */}
          {coroutines.map((coroutine) => {
            return (
              <g key={coroutine.id} className="transition-transform duration-300 ease-in-out">
                <circle
                  cx={coroutine.position.x}
                  cy={coroutine.position.y}
                  r="45"
                  className={`${getStatusColor(coroutine.status)} fill-current transition-all duration-300 ease-in-out`}
                  opacity="0.2"
                />
                <text
                  x={coroutine.position.x}
                  y={coroutine.position.y}
                  textAnchor="middle"
                  className="fill-white text-sm font-mono transition-all duration-300 ease-in-out"
                >
                  <tspan x={coroutine.position.x} dy="-5">
                    {coroutine.name}
                  </tspan>
                  {coroutine.status === 'awaiting' && (
                    <tspan x={coroutine.position.x} dy="20">
                      (await ...)
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Slider Control */}
      <div className="mt-8 w-[700px] flex flex-col items-center gap-4">
        <div className="w-full flex items-center gap-4">
          <input
            type="range"
            min="0"
            max={totalSteps - 1}
            value={step}
            onChange={(e) => setStep(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-white font-mono w-8">{step}/{totalSteps-1}</span>
        </div>
        <div className="text-white font-mono">{getStepDescription(step)}</div>
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">How it works:</h2>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Green: Currently executing (in event loop)</span>
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Yellow: Waiting for execution</span>
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>Purple: Awaiting I/O or other operation</span>
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Blue: Completed execution</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;