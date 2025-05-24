
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Algorithm, Action } from './CryptoLearningTool';

interface StepVisualizerProps {
  algorithm: Algorithm;
  input: string;
  action: Action;
  onComplete: (steps: any[], result: string) => void;
  onBack: () => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  input: string;
  output: string;
  explanation: string;
  visualization?: string;
}

const StepVisualizer: React.FC<StepVisualizerProps> = ({ 
  algorithm, 
  input, 
  action, 
  onComplete, 
  onBack 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    const generatedSteps = generateSteps(algorithm, input, action);
    setSteps(generatedSteps);
    if (generatedSteps.length > 0) {
      setResult(generatedSteps[generatedSteps.length - 1].output);
    }
  }, [algorithm, input, action]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
    } else if (currentStep >= steps.length - 1) {
      setIsAutoPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentStep, steps.length]);

  const generateSteps = (algorithm: Algorithm, input: string, action: Action): Step[] => {
    console.log(`Generating steps for ${algorithm} with action ${action}`);
    
    switch (algorithm) {
      case 'checksum':
        return generateChecksumSteps(input);
      case 'des':
        return generateDESSteps(input, action);
      case 'aes':
        return generateAESSteps(input, action);
      default:
        return [];
    }
  };

  const generateChecksumSteps = (input: string): Step[] => {
    const steps: Step[] = [];
    
    // Step 1: Break into chunks
    const chunks = [];
    for (let i = 0; i < input.length; i += 8) {
      chunks.push(input.substring(i, i + 8));
    }
    
    steps.push({
      id: 1,
      title: 'Step 1: Break Data into Chunks',
      description: 'Divide the input data into fixed-size blocks',
      input: input,
      output: chunks.join(' | '),
      explanation: `Data is broken into ${chunks.length} chunks of up to 8 characters each.`,
      visualization: `Chunks: ${chunks.map((chunk, i) => `[${i + 1}: "${chunk}"]`).join(' ')}`
    });

    // Step 2: Convert to ASCII values
    const asciiValues = chunks.map(chunk => 
      chunk.split('').map(char => char.charCodeAt(0))
    );
    
    steps.push({
      id: 2,
      title: 'Step 2: Convert to ASCII Values',
      description: 'Convert each character to its ASCII numeric value',
      input: chunks.join(' | '),
      output: asciiValues.map(chunk => chunk.join(',')).join(' | '),
      explanation: 'Each character is converted to its ASCII value for mathematical operations.',
      visualization: asciiValues.map((chunk, i) => 
        `Chunk ${i + 1}: [${chunk.join(', ')}]`
      ).join('\n')
    });

    // Step 3: Sum each chunk
    const chunkSums = asciiValues.map(chunk => 
      chunk.reduce((sum, val) => sum + val, 0)
    );
    
    steps.push({
      id: 3,
      title: 'Step 3: Sum Each Chunk',
      description: 'Calculate the sum of ASCII values in each chunk',
      input: asciiValues.map(chunk => chunk.join(',')).join(' | '),
      output: chunkSums.join(', '),
      explanation: 'Sum the ASCII values within each chunk to get intermediate results.',
      visualization: chunkSums.map((sum, i) => 
        `Chunk ${i + 1} sum: ${sum}`
      ).join('\n')
    });

    // Step 4: Calculate final checksum
    const totalSum = chunkSums.reduce((sum, val) => sum + val, 0);
    const checksum = (~totalSum) & 0xFFFF; // 16-bit one's complement
    
    steps.push({
      id: 4,
      title: 'Step 4: Calculate Final Checksum',
      description: 'Sum all chunk values and apply one\'s complement',
      input: chunkSums.join(' + '),
      output: `Checksum: ${checksum.toString(16).toUpperCase().padStart(4, '0')}`,
      explanation: `Total sum: ${totalSum}, One's complement: ${checksum}`,
      visualization: `Final calculation: ~(${totalSum}) = ${checksum} (0x${checksum.toString(16).toUpperCase()})`
    });

    return steps;
  };

  const generateDESSteps = (input: string, action: Action): Step[] => {
    const steps: Step[] = [];
    
    // Simplified DES demonstration
    const paddedInput = input.padEnd(8, ' ').substring(0, 8);
    
    steps.push({
      id: 1,
      title: 'Step 1: Initial Permutation',
      description: 'Rearrange the input bits according to DES initial permutation table',
      input: paddedInput,
      output: paddedInput.split('').reverse().join(''),
      explanation: 'The 64-bit input block is permuted according to a fixed table.',
      visualization: 'IP: Bits are rearranged in a specific pattern'
    });

    let currentData = paddedInput.split('').reverse().join('');
    
    // Simulate 16 rounds (simplified)
    for (let round = 1; round <= 3; round++) { // Show only 3 rounds for demo
      const left = currentData.substring(0, 4);
      const right = currentData.substring(4);
      const newRight = left;
      const newLeft = right.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ (round + i))
      ).join('');
      
      currentData = newLeft + newRight;
      
      steps.push({
        id: round + 1,
        title: `Step ${round + 1}: Round ${round}`,
        description: `Apply DES round function with round key ${round}`,
        input: left + ' | ' + right,
        output: newLeft + ' | ' + newRight,
        explanation: `Feistel structure: L${round} = R${round-1}, R${round} = L${round-1} ⊕ f(R${round-1}, K${round})`,
        visualization: `Round ${round}: Applying round function with key derivation`
      });
    }

    steps.push({
      id: steps.length + 1,
      title: 'Step 5: Final Permutation',
      description: 'Apply the final permutation (inverse of initial permutation)',
      input: currentData,
      output: action === 'encrypt' ? 
        Buffer.from(currentData).toString('base64').substring(0, 12) + '...' :
        currentData.split('').reverse().join(''),
      explanation: 'The final 64-bit result after applying the inverse permutation.',
      visualization: 'FP: Final rearrangement of bits to produce ciphertext'
    });

    return steps;
  };

  const generateAESSteps = (input: string, action: Action): Step[] => {
    const steps: Step[] = [];
    
    // Simplified AES demonstration
    const paddedInput = input.padEnd(16, ' ').substring(0, 16);
    
    steps.push({
      id: 1,
      title: 'Step 1: AddRoundKey (Initial)',
      description: 'XOR the input with the initial round key',
      input: paddedInput,
      output: paddedInput.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ (0x2B + i))
      ).join(''),
      explanation: 'The plaintext is XORed with the expanded key for round 0.',
      visualization: 'Initial key addition using XOR operation'
    });

    let currentState = paddedInput.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ (0x2B + i))
    ).join('');

    // Show 3 rounds (simplified)
    for (let round = 1; round <= 3; round++) {
      // SubBytes
      const afterSubBytes = currentState.split('').map(char => 
        String.fromCharCode(((char.charCodeAt(0) + round) % 256))
      ).join('');
      
      steps.push({
        id: steps.length + 1,
        title: `Step ${steps.length + 1}: SubBytes (Round ${round})`,
        description: 'Substitute bytes using AES S-box',
        input: currentState,
        output: afterSubBytes,
        explanation: 'Each byte is replaced using a substitution table (S-box).',
        visualization: `Round ${round}: S-box substitution applied to all 16 bytes`
      });

      // ShiftRows
      const afterShiftRows = afterSubBytes.split('').map((char, i) => 
        afterSubBytes.charAt((i + Math.floor(i / 4)) % 16)
      ).join('');
      
      steps.push({
        id: steps.length + 1,
        title: `Step ${steps.length + 1}: ShiftRows (Round ${round})`,
        description: 'Cyclically shift rows of the state matrix',
        input: afterSubBytes,
        output: afterShiftRows,
        explanation: 'Rows are shifted left by different amounts: row 0 (0), row 1 (1), row 2 (2), row 3 (3).',
        visualization: `Round ${round}: Row shifting for diffusion`
      });

      // MixColumns (skip in last round)
      if (round < 3) {
        const afterMixColumns = afterShiftRows.split('').map((char, i) => 
          String.fromCharCode((char.charCodeAt(0) * 2 + round) % 256)
        ).join('');
        
        steps.push({
          id: steps.length + 1,
          title: `Step ${steps.length + 1}: MixColumns (Round ${round})`,
          description: 'Mix columns using matrix multiplication',
          input: afterShiftRows,
          output: afterMixColumns,
          explanation: 'Each column is multiplied by a fixed matrix in GF(2^8).',
          visualization: `Round ${round}: Matrix multiplication for column mixing`
        });
        
        currentState = afterMixColumns;
      } else {
        currentState = afterShiftRows;
      }

      // AddRoundKey
      const afterAddRoundKey = currentState.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ (0x2B + round + i))
      ).join('');
      
      steps.push({
        id: steps.length + 1,
        title: `Step ${steps.length + 1}: AddRoundKey (Round ${round})`,
        description: `XOR with round ${round} key`,
        input: currentState,
        output: afterAddRoundKey,
        explanation: `State is XORed with the expanded key for round ${round}.`,
        visualization: `Round ${round}: Key addition using XOR`
      });
      
      currentState = afterAddRoundKey;
    }

    // Final result
    const finalResult = action === 'encrypt' ? 
      Buffer.from(currentState).toString('base64') :
      currentState;
      
    steps[steps.length - 1].output = finalResult;

    return steps;
  };

  const handleComplete = () => {
    onComplete(steps, result);
  };

  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Generating algorithm steps...</p>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {algorithm.toUpperCase()} Step-by-Step Visualization
          </h2>
          <p className="text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        
        <Button 
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isAutoPlaying ? 'Pause' : 'Auto Play'}
        </Button>
      </div>

      <div className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="text-sm text-gray-500 text-center">
          Progress: {Math.round(progress)}%
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700 text-lg">{currentStepData.description}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-green-700">Input</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-green-50 p-4 rounded border-2 border-green-200 overflow-auto">
                  {currentStepData.input}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-blue-50 p-4 rounded border-2 border-blue-200 overflow-auto">
                  {currentStepData.output}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-purple-700">Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">{currentStepData.explanation}</p>
              {currentStepData.visualization && (
                <div className="bg-purple-50 p-4 rounded border-2 border-purple-200">
                  <div className="font-mono text-sm whitespace-pre-line">
                    {currentStepData.visualization}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Step
        </Button>

        <div className="flex gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-blue-600' 
                  : index < currentStep 
                    ? 'bg-green-400' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex items-center gap-2"
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleComplete}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            View Results
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepVisualizer;
