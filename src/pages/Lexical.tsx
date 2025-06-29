
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Token {
  type: string;
  value: string;
  line: number;
  column: number;
}

const Lexical = () => {
  const [sourceCode, setSourceCode] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const tokenTypes = {
    KEYWORD: ['int', 'float', 'char', 'void', 'if', 'else', 'while', 'for', 'return', 'include', 'stdio', 'main'],
    OPERATOR: ['+', '-', '*', '/', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!'],
    DELIMITER: [';', ',', '(', ')', '{', '}', '[', ']'],
    IDENTIFIER: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    NUMBER: /^[0-9]+(\.[0-9]+)?$/,
    STRING: /^".*"$/,
    COMMENT: /^\/\/.*|^\/\*[\s\S]*?\*\/$/
  };

  const analyzeCode = () => {
    if (!sourceCode.trim()) return;
    
    setIsAnalyzing(true);
    const foundTokens: Token[] = [];
    const lines = sourceCode.split('\n');

    lines.forEach((line, lineIndex) => {
      let column = 0;
      let i = 0;

      while (i < line.length) {
        // Skip whitespace
        if (/\s/.test(line[i])) {
          column++;
          i++;
          continue;
        }

        let tokenFound = false;
        
        // Check for multi-character operators
        if (i < line.length - 1) {
          const twoChar = line.slice(i, i + 2);
          if (tokenTypes.OPERATOR.includes(twoChar)) {
            foundTokens.push({
              type: 'OPERATOR',
              value: twoChar,
              line: lineIndex + 1,
              column: column + 1
            });
            i += 2;
            column += 2;
            tokenFound = true;
          }
        }

        if (!tokenFound) {
          // Check for single character tokens
          const char = line[i];
          
          if (tokenTypes.OPERATOR.includes(char)) {
            foundTokens.push({
              type: 'OPERATOR',
              value: char,
              line: lineIndex + 1,
              column: column + 1
            });
            i++;
            column++;
          } else if (tokenTypes.DELIMITER.includes(char)) {
            foundTokens.push({
              type: 'DELIMITER',
              value: char,
              line: lineIndex + 1,
              column: column + 1
            });
            i++;
            column++;
          } else {
            // Extract word/number
            let token = '';
            const startColumn = column;
            
            while (i < line.length && !/\s/.test(line[i]) && 
                   !tokenTypes.OPERATOR.includes(line[i]) && 
                   !tokenTypes.DELIMITER.includes(line[i])) {
              token += line[i];
              i++;
              column++;
            }
            
            if (token) {
              let type = 'IDENTIFIER';
              
              if (tokenTypes.KEYWORD.includes(token)) {
                type = 'KEYWORD';
              } else if (tokenTypes.NUMBER.test(token)) {
                type = 'NUMBER';
              } else if (tokenTypes.STRING.test(token)) {
                type = 'STRING';
              }
              
              foundTokens.push({
                type,
                value: token,
                line: lineIndex + 1,
                column: startColumn + 1
              });
            }
          }
        }
      }
    });

    setTimeout(() => {
      setTokens(foundTokens);
      setIsAnalyzing(false);
    }, 1000);
  };

  const getTokenColor = (type: string) => {
    switch (type) {
      case 'KEYWORD': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'OPERATOR': return 'bg-red-100 text-red-800 border-red-300';
      case 'DELIMITER': return 'bg-green-100 text-green-800 border-green-300';
      case 'IDENTIFIER': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'NUMBER': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'STRING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Lexical Token Analyzer</h1>
          <Link to="/" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="border-2 border-black rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">C Source Code Input</h2>
            
            <div className="space-y-4">
              <Textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="Enter your C source code here..."
                className="border-black min-h-[300px] font-mono text-sm"
                rows={15}
              />
              
              <Button
                onClick={analyzeCode}
                disabled={!sourceCode.trim() || isAnalyzing}
                className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Code"}
              </Button>
            </div>

            {/* Sample Code Button */}
            <div className="mt-4">
              <Button
                onClick={() => setSourceCode(`#include <stdio.h>

int main() {
    int num1 = 10;
    int num2 = 20;
    int sum = num1 + num2;
    
    if (sum > 25) {
        printf("Sum is greater than 25");
    } else {
        printf("Sum is less than or equal to 25");
    }
    
    return 0;
}`)}
                variant="outline"
                className="w-full border-black hover:bg-gray-100"
              >
                Load Sample Code
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="border-2 border-black rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Token Analysis Results</h2>
            
            {tokens.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Total tokens found: <span className="font-bold text-black">{tokens.length}</span>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {tokens.map((token, index) => (
                    <motion.div
                      key={index}
                      className={`p-3 rounded border-2 ${getTokenColor(token.type)}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs px-2 py-1 bg-white rounded">
                            {token.type}
                          </span>
                          <span className="font-mono font-bold">
                            {token.value}
                          </span>
                        </div>
                        <span className="text-xs opacity-75">
                          Line {token.line}, Col {token.column}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Token Statistics */}
                <div className="mt-6 p-4 bg-gray-50 rounded border">
                  <h3 className="font-bold mb-2">Token Statistics</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(
                      tokens.reduce((acc, token) => {
                        acc[token.type] = (acc[token.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span>{type}:</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Enter C source code and click "Analyze Code" to see token breakdown
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lexical;
