
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Sorting = () => {
  const [array, setArray] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [algorithm, setAlgorithm] = useState("");
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<number[][]>([]);

  const bubbleSort = (arr: number[]) => {
    const steps: number[][] = [];
    const sortedArray = [...arr];
    steps.push([...sortedArray]);

    for (let i = 0; i < sortedArray.length - 1; i++) {
      for (let j = 0; j < sortedArray.length - i - 1; j++) {
        if (sortedArray[j] > sortedArray[j + 1]) {
          [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
          steps.push([...sortedArray]);
        }
      }
    }
    return steps;
  };

  const quickSort = (arr: number[], start = 0, end = arr.length - 1, steps: number[][] = []) => {
    if (start >= end) return steps;
    
    const pivot = partition(arr, start, end, steps);
    quickSort(arr, start, pivot - 1, steps);
    quickSort(arr, pivot + 1, end, steps);
    return steps;
  };

  const partition = (arr: number[], start: number, end: number, steps: number[][]) => {
    const pivot = arr[end];
    let i = start - 1;

    for (let j = start; j < end; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push([...arr]);
      }
    }
    [arr[i + 1], arr[end]] = [arr[end], arr[i + 1]];
    steps.push([...arr]);
    return i + 1;
  };

  const handleInputSubmit = () => {
    const numbers = inputValue.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    setArray(numbers);
    setCurrentStep(0);
    setSteps([]);
  };

  const startVisualization = () => {
    if (array.length === 0 || !algorithm) return;

    setIsVisualizing(true);
    setCurrentStep(0);

    let sortingSteps: number[][] = [];
    
    if (algorithm === "bubble") {
      sortingSteps = bubbleSort(array);
    } else if (algorithm === "quick") {
      const arrayCopy = [...array];
      sortingSteps = [arrayCopy];
      quickSort(arrayCopy, 0, arrayCopy.length - 1, sortingSteps);
    }

    setSteps(sortingSteps);

    // Animate through steps
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex >= sortingSteps.length) {
        clearInterval(interval);
        setIsVisualizing(false);
      } else {
        setCurrentStep(stepIndex);
      }
    }, 800);
  };

  const currentArray = steps.length > 0 ? steps[currentStep] : array;

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Sorting Algorithm Visualizer</h1>
          <Link to="/" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="border-2 border-black rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Input Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter numbers (comma-separated):
                </label>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g., 64, 34, 25, 12, 22, 11, 90"
                  className="border-black"
                />
              </div>

              <Button 
                onClick={handleInputSubmit}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Set Array
              </Button>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Algorithm:
                </label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Choose sorting algorithm" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-black">
                    <SelectItem value="bubble">Bubble Sort</SelectItem>
                    <SelectItem value="quick">Quick Sort</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startVisualization}
                disabled={array.length === 0 || !algorithm || isVisualizing}
                className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                {isVisualizing ? "Visualizing..." : "Start Visualization"}
              </Button>
            </div>
          </div>

          {/* Visualization Section */}
          <div className="border-2 border-black rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Visualization</h2>
            
            {currentArray.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-end justify-center space-x-2 h-64">
                  {currentArray.map((value, index) => (
                    <motion.div
                      key={`${index}-${value}`}
                      className="bg-black text-white flex items-center justify-center min-w-[40px] text-sm font-medium"
                      style={{ height: `${(value / Math.max(...currentArray)) * 200}px` }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {value}
                    </motion.div>
                  ))}
                </div>
                
                <div className="text-center">
                  <p className="text-lg">
                    Step: {currentStep} / {steps.length > 0 ? steps.length - 1 : 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Current Array: [{currentArray.join(', ')}]
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Enter an array to visualize sorting
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Sorting;
