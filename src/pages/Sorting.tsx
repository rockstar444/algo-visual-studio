
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

  const mergeSort = (arr: number[], steps: number[][] = []) => {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid), steps);
    const right = mergeSort(arr.slice(mid), steps);

    return merge(left, right, steps);
  };

  const merge = (left: number[], right: number[], steps: number[][]) => {
    const result: number[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex] < right[rightIndex]) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
      steps.push([...result, ...left.slice(leftIndex), ...right.slice(rightIndex)]);
    }

    while (leftIndex < left.length) {
      result.push(left[leftIndex]);
      leftIndex++;
      steps.push([...result, ...right.slice(rightIndex)]);
    }

    while (rightIndex < right.length) {
      result.push(right[rightIndex]);
      rightIndex++;
      steps.push([...result]);
    }

    return result;
  };

  const heapSort = (arr: number[]) => {
    const steps: number[][] = [];
    const sortedArray = [...arr];
    const n = sortedArray.length;
    steps.push([...sortedArray]);

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(sortedArray, n, i, steps);
    }

    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
      [sortedArray[0], sortedArray[i]] = [sortedArray[i], sortedArray[0]];
      steps.push([...sortedArray]);
      heapify(sortedArray, i, 0, steps);
    }

    return steps;
  };

  const heapify = (arr: number[], n: number, i: number, steps: number[][]) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest]) {
      largest = left;
    }

    if (right < n && arr[right] > arr[largest]) {
      largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      steps.push([...arr]);
      heapify(arr, n, largest, steps);
    }
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
    } else if (algorithm === "merge") {
      const arrayCopy = [...array];
      sortingSteps = [arrayCopy];
      mergeSort(arrayCopy, sortingSteps);
    } else if (algorithm === "heap") {
      sortingSteps = heapSort(array);
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

  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case "bubble":
        return {
          name: "Bubble Sort",
          description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order.",
          complexity: "O(n²)",
          characteristics: ["Simple implementation", "Stable sorting", "In-place algorithm", "Poor performance on large datasets"]
        };
      case "quick":
        return {
          name: "Quick Sort",
          description: "Divides the array into smaller sub-arrays using a pivot element, then recursively sorts the sub-arrays.",
          complexity: "O(n log n) average, O(n²) worst case",
          characteristics: ["Divide and conquer approach", "In-place algorithm", "Not stable", "Excellent average performance"]
        };
      case "merge":
        return {
          name: "Merge Sort",
          description: "Divides the array into halves, recursively sorts them, then merges the sorted halves back together.",
          complexity: "O(n log n)",
          characteristics: ["Divide and conquer approach", "Stable sorting", "Requires additional space", "Guaranteed O(n log n) performance"]
        };
      case "heap":
        return {
          name: "Heap Sort",
          description: "Builds a max heap from the array, then repeatedly extracts the maximum element to create a sorted array.",
          complexity: "O(n log n)",
          characteristics: ["Uses heap data structure", "In-place algorithm", "Not stable", "Consistent performance"]
        };
      default:
        return null;
    }
  };

  const currentArray = steps.length > 0 ? steps[currentStep] : array;
  const algorithmInfo = getAlgorithmDescription();

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

        {/* Algorithm Information */}
        {algorithmInfo && (
          <div className="border-2 border-black rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{algorithmInfo.name}</h2>
            <p className="text-gray-700 mb-4">{algorithmInfo.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">Time Complexity:</h3>
                <p className="text-gray-600">{algorithmInfo.complexity}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Characteristics:</h3>
                <ul className="text-gray-600 space-y-1">
                  {algorithmInfo.characteristics.map((char, index) => (
                    <li key={index}>• {char}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

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
                    <SelectItem value="merge">Merge Sort</SelectItem>
                    <SelectItem value="heap">Heap Sort</SelectItem>
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

              <Button
                onClick={() => setInputValue("64, 34, 25, 12, 22, 11, 90")}
                variant="outline"
                className="w-full border-black hover:bg-gray-100"
              >
                Load Sample Data
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

        {/* Sorting Algorithms Overview */}
        <div className="border-2 border-black rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">Sorting Algorithms Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Bubble Sort</h3>
              <p className="text-sm text-gray-600">Simple comparison-based algorithm that repeatedly swaps adjacent elements.</p>
              <p className="text-xs"><strong>Best for:</strong> Learning purposes, small datasets</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Quick Sort</h3>
              <p className="text-sm text-gray-600">Efficient divide-and-conquer algorithm using pivot partitioning.</p>
              <p className="text-xs"><strong>Best for:</strong> General-purpose sorting, large datasets</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Merge Sort</h3>
              <p className="text-sm text-gray-600">Stable divide-and-conquer algorithm with guaranteed O(n log n) performance.</p>
              <p className="text-xs"><strong>Best for:</strong> Stable sorting, linked lists</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Heap Sort</h3>
              <p className="text-sm text-gray-600">Uses binary heap data structure for efficient in-place sorting.</p>
              <p className="text-xs"><strong>Best for:</strong> Memory-constrained environments</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Sorting;
