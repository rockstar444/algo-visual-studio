
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { List, Circle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <motion.div 
        className="text-center py-16"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl font-bold mb-6">
          Sorting and Scheduling Algorithm Visualizer
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto px-4">
          Master Data Structures and Algorithms through interactive visualizations, CPU 
          scheduling simulations, and lexical analysis
        </p>
      </motion.div>

      {/* Main Cards */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sorting Algorithms Card */}
          <motion.div
            className="border-2 border-black rounded-lg p-8 bg-white hover:bg-gray-50 transition-colors"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <List className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4">Sorting Algorithms</h3>
            <p className="text-gray-600 text-center mb-8">
              Visualize Bubble Sort, Quick Sort, and Merge Sort operations
            </p>
            <Link 
              to="/sorting"
              className="block w-full bg-black text-white text-center py-3 rounded font-medium hover:bg-gray-800 transition-colors"
            >
              Explore
            </Link>
          </motion.div>

          {/* CPU Scheduling Card */}
          <motion.div
            className="border-2 border-black rounded-lg p-8 bg-white hover:bg-gray-50 transition-colors"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <Circle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4">CPU Scheduling</h3>
            <p className="text-gray-600 text-center mb-8">
              Simulate FCFS, SJF, and Round Robin algorithms
            </p>
            <Link 
              to="/scheduling"
              className="block w-full bg-black text-white text-center py-3 rounded font-medium hover:bg-gray-800 transition-colors"
            >
              Explore
            </Link>
          </motion.div>

          {/* Lexical Tokens Card */}
          <motion.div
            className="border-2 border-black rounded-lg p-8 bg-white hover:bg-gray-50 transition-colors"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">&lt;/&gt;</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4">Lexical Tokens</h3>
            <p className="text-gray-600 text-center mb-8">
              Analyze C source code and break down into tokens
            </p>
            <Link 
              to="/lexical"
              className="block w-full bg-black text-white text-center py-3 rounded font-medium hover:bg-gray-800 transition-colors"
            >
              Explore
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Interactive Learning Experience Section */}
      <motion.div
        className="max-w-7xl mx-auto px-8 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="border-2 border-black rounded-lg p-12 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-6">Interactive Learning Experience</h2>
          <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto">
            Step through algorithms, visualize data structure operations, understand CPU scheduling, and 
            analyze lexical tokens with real-time animations and interactive controls.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
