
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

interface ProcessWithRemaining extends Process {
  remainingTime: number;
}

interface GanttSegment {
  processId: string;
  startTime: number;
  endTime: number;
  isIdle?: boolean;
}

interface Metrics {
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  processMetrics: Array<{
    id: string;
    waitingTime: number;
    turnaroundTime: number;
  }>;
}

const Scheduling = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [algorithm, setAlgorithm] = useState("");
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [ganttChart, setGanttChart] = useState<GanttSegment[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [dynamicPriority, setDynamicPriority] = useState(false);

  const addProcess = () => {
    const newProcess: Process = {
      id: `P${processes.length + 1}`,
      arrivalTime: 0,
      burstTime: 1,
      priority: 1
    };
    setProcesses([...processes, newProcess]);
  };

  const updateProcess = (index: number, field: keyof Process, value: number) => {
    const updated = [...processes];
    updated[index] = { ...updated[index], [field]: value };
    setProcesses(updated);
  };

  const removeProcess = (index: number) => {
    setProcesses(processes.filter((_, i) => i !== index));
  };

  const resetProcesses = () => {
    setProcesses([]);
    setGanttChart([]);
    setMetrics(null);
  };

  const calculateMetrics = (gantt: GanttSegment[], processes: Process[]) => {
    const processMetrics = processes.map(process => {
      const completionTime = Math.max(...gantt
        .filter(segment => segment.processId === process.id)
        .map(segment => segment.endTime));
      
      const turnaroundTime = completionTime - process.arrivalTime;
      const waitingTime = turnaroundTime - process.burstTime;

      return {
        id: process.id,
        waitingTime,
        turnaroundTime
      };
    });

    const averageWaitingTime = processMetrics.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length;
    const averageTurnaroundTime = processMetrics.reduce((sum, p) => sum + p.turnaroundTime, 0) / processes.length;

    return {
      averageWaitingTime,
      averageTurnaroundTime,
      processMetrics
    };
  };

  const fcfsScheduling = (processes: Process[]) => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const gantt: GanttSegment[] = [];
    let currentTime = 0;

    sortedProcesses.forEach(process => {
      if (currentTime < process.arrivalTime) {
        gantt.push({
          processId: "IDLE",
          startTime: currentTime,
          endTime: process.arrivalTime,
          isIdle: true
        });
        currentTime = process.arrivalTime;
      }

      gantt.push({
        processId: process.id,
        startTime: currentTime,
        endTime: currentTime + process.burstTime
      });
      currentTime += process.burstTime;
    });

    return gantt;
  };

  const sjfScheduling = (processes: Process[]) => {
    const gantt: GanttSegment[] = [];
    const remaining: ProcessWithRemaining[] = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    let currentTime = 0;
    const completed: string[] = [];

    while (completed.length < processes.length) {
      const available = remaining.filter(p => 
        p.arrivalTime <= currentTime && !completed.includes(p.id)
      );

      if (available.length === 0) {
        const nextArrival = Math.min(...remaining
          .filter(p => !completed.includes(p.id))
          .map(p => p.arrivalTime)
        );
        
        gantt.push({
          processId: "IDLE",
          startTime: currentTime,
          endTime: nextArrival,
          isIdle: true
        });
        currentTime = nextArrival;
        continue;
      }

      const shortest = available.reduce((min, p) => 
        p.burstTime < min.burstTime ? p : min
      );

      gantt.push({
        processId: shortest.id,
        startTime: currentTime,
        endTime: currentTime + shortest.burstTime
      });

      currentTime += shortest.burstTime;
      completed.push(shortest.id);
    }

    return gantt;
  };

  const roundRobinScheduling = (processes: Process[]) => {
    const gantt: GanttSegment[] = [];
    const queue: ProcessWithRemaining[] = [];
    const remaining: ProcessWithRemaining[] = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    let currentTime = 0;
    let i = 0;

    if (remaining.length > 0) {
      queue.push(remaining[0]);
      i = 1;
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const executeTime = Math.min(current.remainingTime, timeQuantum);

      gantt.push({
        processId: current.id,
        startTime: currentTime,
        endTime: currentTime + executeTime
      });

      currentTime += executeTime;
      current.remainingTime -= executeTime;

      while (i < remaining.length && remaining[i].arrivalTime <= currentTime) {
        queue.push(remaining[i]);
        i++;
      }

      if (current.remainingTime > 0) {
        queue.push(current);
      }

      if (queue.length === 0 && i < remaining.length) {
        const nextArrival = remaining[i].arrivalTime;
        gantt.push({
          processId: "IDLE",
          startTime: currentTime,
          endTime: nextArrival,
          isIdle: true
        });
        currentTime = nextArrival;
        queue.push(remaining[i]);
        i++;
      }
    }

    return gantt;
  };

  const runScheduling = () => {
    if (processes.length === 0 || !algorithm) return;

    let gantt: GanttSegment[] = [];

    switch (algorithm) {
      case "fcfs":
        gantt = fcfsScheduling(processes);
        break;
      case "sjf":
        gantt = sjfScheduling(processes);
        break;
      case "rr":
        gantt = roundRobinScheduling(processes);
        break;
    }

    setGanttChart(gantt);
    setMetrics(calculateMetrics(gantt, processes));
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">CPU Scheduling Simulator</h1>
          <Link to="/" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Back to Home
          </Link>
        </div>

        {/* Algorithm Selection Tabs */}
        <div className="flex border-2 border-black rounded-lg mb-8">
          <button
            onClick={() => setAlgorithm("fcfs")}
            className={`flex-1 py-3 px-4 font-medium ${
              algorithm === "fcfs" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            FCFS
          </button>
          <button
            onClick={() => setAlgorithm("sjf")}
            className={`flex-1 py-3 px-4 font-medium border-l border-r border-black ${
              algorithm === "sjf" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            SJF
          </button>
          <button
            onClick={() => setAlgorithm("rr")}
            className={`flex-1 py-3 px-4 font-medium ${
              algorithm === "rr" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            Round Robin
          </button>
        </div>

        {/* Algorithm Description */}
        {algorithm && (
          <div className="border-2 border-black rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {algorithm === "fcfs" && "FCFS (First Come First Serve) Scheduler"}
              {algorithm === "sjf" && "SJF (Shortest Job First) Scheduler"}
              {algorithm === "rr" && "Round Robin Scheduler"}
            </h2>
            
            {algorithm === "fcfs" && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="dynamic-priority" 
                    checked={dynamicPriority}
                    onCheckedChange={setDynamicPriority}
                  />
                  <label htmlFor="dynamic-priority" className="text-sm font-medium">
                    Enable Dynamic Priority Scheduling
                  </label>
                </div>
                <p>• Processes are executed in the order they arrive</p>
                <p>• Simple and fair scheduling algorithm</p>
                <p>• Can cause "convoy effect" with long processes</p>
                <p>• Non-preemptive scheduling</p>
              </div>
            )}
            
            {algorithm === "sjf" && (
              <div className="space-y-2">
                <p>• Processes with shortest burst time are executed first</p>
                <p>• Optimal for minimizing average waiting time</p>
                <p>• Can cause starvation for longer processes</p>
                <p>• Non-preemptive scheduling</p>
              </div>
            )}
            
            {algorithm === "rr" && (
              <div className="space-y-2">
                <p>• Each process gets equal time quantum for execution</p>
                <p>• Fair scheduling algorithm for time-sharing systems</p>
                <p>• Preemptive scheduling with time slicing</p>
                <p>• Performance depends on time quantum selection</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="border-2 border-black rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Process Configuration</h2>
              
              <div className="space-y-4">
                {algorithm === "rr" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Quantum:</label>
                    <Input
                      type="number"
                      value={timeQuantum}
                      onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                      className="border-black"
                      min="1"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Process Name (e.g., P1)"
                    className="border-black"
                    id="process-name"
                  />
                  <Input
                    type="number"
                    placeholder="Arrival Time"
                    className="border-black"
                    id="arrival-time"
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Burst Time"
                    className="border-black"
                    id="burst-time"
                    min="1"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={addProcess} className="flex-1 bg-black text-white hover:bg-gray-800">
                    Add Process
                  </Button>
                  <Button onClick={resetProcesses} variant="outline" className="border-black hover:bg-gray-100">
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Process List */}
            <div className="border-2 border-black rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Processes</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {processes.map((process, index) => (
                  <div key={process.id} className="grid grid-cols-4 gap-2 p-3 border border-gray-300 rounded">
                    <div>
                      <label className="text-xs font-medium">Process</label>
                      <div className="text-sm font-bold">{process.id}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Arrival</label>
                      <Input
                        type="number"
                        value={process.arrivalTime}
                        onChange={(e) => updateProcess(index, 'arrivalTime', parseInt(e.target.value))}
                        className="border-black h-8"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Burst</label>
                      <Input
                        type="number"
                        value={process.burstTime}
                        onChange={(e) => updateProcess(index, 'burstTime', parseInt(e.target.value))}
                        className="border-black h-8"
                        min="1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeProcess(index)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={runScheduling}
                disabled={processes.length === 0 || !algorithm}
                className="w-full mt-4 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                Start Simulation
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Gantt Chart */}
            <div className="border-2 border-black rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Gantt Chart</h2>
              
              {ganttChart.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-1 overflow-x-auto pb-2">
                    {ganttChart.map((segment, index) => (
                      <motion.div
                        key={index}
                        className={`min-w-[60px] h-12 flex items-center justify-center text-xs font-medium border-2 border-black ${
                          segment.isIdle ? 'bg-gray-200 text-gray-600' : 'bg-black text-white'
                        }`}
                        style={{ width: `${(segment.endTime - segment.startTime) * 40}px` }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {segment.processId}
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-1 overflow-x-auto">
                    {ganttChart.map((segment, index) => (
                      <div
                        key={index}
                        className="min-w-[60px] text-xs text-center"
                        style={{ width: `${(segment.endTime - segment.startTime) * 40}px` }}
                      >
                        <div className="border-l border-black h-2"></div>
                        <span>{segment.startTime}</span>
                      </div>
                    ))}
                    <div className="text-xs">
                      <div className="border-l border-black h-2"></div>
                      <span>{ganttChart[ganttChart.length - 1]?.endTime}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  Configure processes and run scheduling to see Gantt chart
                </div>
              )}
            </div>

            {/* Metrics */}
            {metrics && (
              <div className="border-2 border-black rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border border-gray-300 rounded">
                      <div className="text-2xl font-bold">{metrics.averageWaitingTime.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Average Waiting Time</div>
                    </div>
                    <div className="text-center p-3 border border-gray-300 rounded">
                      <div className="text-2xl font-bold">{metrics.averageTurnaroundTime.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Average Turnaround Time</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold">Individual Process Metrics:</h4>
                    {metrics.processMetrics.map(process => (
                      <div key={process.id} className="flex justify-between text-sm">
                        <span>{process.id}:</span>
                        <span>WT: {process.waitingTime}, TAT: {process.turnaroundTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Scheduling;
