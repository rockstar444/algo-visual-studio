
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

interface GanttSegment {
  processId: string;
  startTime: number;
  endTime: number;
  isIdle?: boolean;
}

const Scheduling = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [algorithm, setAlgorithm] = useState("");
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [ganttChart, setGanttChart] = useState<GanttSegment[]>([]);
  const [metrics, setMetrics] = useState<any>({});

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

  const fcfsScheduling = (processes: Process[]) => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const gantt: GanttSegment[] = [];
    let currentTime = 0;

    sortedProcesses.forEach(process => {
      // Add idle time if there's a gap
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
    const remaining = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    let currentTime = 0;
    const completed: string[] = [];

    while (completed.length < processes.length) {
      const available = remaining.filter(p => 
        p.arrivalTime <= currentTime && !completed.includes(p.id)
      );

      if (available.length === 0) {
        // Find next arrival time
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
    const queue: Process[] = [];
    const remaining = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    let currentTime = 0;
    let i = 0;

    // Add first process
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

      // Add newly arrived processes
      while (i < remaining.length && remaining[i].arrivalTime <= currentTime) {
        queue.push(remaining[i]);
        i++;
      }

      // Re-add current process if not finished
      if (current.remainingTime > 0) {
        queue.push(current);
      }

      // Handle idle time
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="border-2 border-black rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Process Configuration</h2>
              
              <div className="space-y-4">
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select scheduling algorithm" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-black">
                    <SelectItem value="fcfs">First Come First Serve (FCFS)</SelectItem>
                    <SelectItem value="sjf">Shortest Job First (SJF)</SelectItem>
                    <SelectItem value="rr">Round Robin (RR)</SelectItem>
                  </SelectContent>
                </Select>

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

                <Button onClick={addProcess} className="w-full bg-black text-white hover:bg-gray-800">
                  Add Process
                </Button>
              </div>
            </div>

            {/* Process List */}
            <div className="border-2 border-black rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Processes</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {processes.map((process, index) => (
                  <div key={process.id} className="grid grid-cols-3 gap-2 p-3 border border-gray-300 rounded">
                    <div>
                      <label className="text-xs font-medium">Arrival Time</label>
                      <Input
                        type="number"
                        value={process.arrivalTime}
                        onChange={(e) => updateProcess(index, 'arrivalTime', parseInt(e.target.value))}
                        className="border-black h-8"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Burst Time</label>
                      <Input
                        type="number"
                        value={process.burstTime}
                        onChange={(e) => updateProcess(index, 'burstTime', parseInt(e.target.value))}
                        className="border-black h-8"
                        min="1"
                      />
                    </div>
                    <div className="flex items-end">
                      <span className="text-sm font-medium">{process.id}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={runScheduling}
                disabled={processes.length === 0 || !algorithm}
                className="w-full mt-4 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                Run Scheduling
              </Button>
            </div>
          </div>

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

                <div className="text-sm space-y-2">
                  <h4 className="font-bold">Timeline:</h4>
                  {ganttChart.map((segment, index) => (
                    <div key={index} className="flex justify-between">
                      <span className={segment.isIdle ? 'text-gray-600' : ''}>
                        {segment.processId}: {segment.startTime} - {segment.endTime}
                      </span>
                      <span className="text-gray-600">
                        Duration: {segment.endTime - segment.startTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Configure processes and run scheduling to see Gantt chart
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Scheduling;
