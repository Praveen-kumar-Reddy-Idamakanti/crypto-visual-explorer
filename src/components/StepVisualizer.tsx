
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Play, Pause, Key, Lock, Unlock, Repeat } from 'lucide-react';
import { Algorithm, Action } from './CryptoLearningTool';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  visualizationType?: 'matrix' | 'bits' | 'text' | 'diagram';
  visualizationData?: any;
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
  const [visualTab, setVisualTab] = useState('detailed');

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
    const key = "CRYPTO01"; // A sample 8-byte key
    
    // Simplified DES demonstration
    const paddedInput = input.padEnd(8, ' ').substring(0, 8);
    
    // Initial permutation visualization
    const initialData = paddedInput.split('');
    const initialPermutation = paddedInput.split('').reverse();
    
    steps.push({
      id: 1,
      title: 'Step 1: Initial Permutation (IP)',
      description: 'Rearrange the 64-bit input block according to the DES initial permutation table',
      input: paddedInput,
      output: initialPermutation.join(''),
      explanation: 'The 64-bit input block undergoes a fixed initial permutation that rearranges the bits in a defined order, independent of the key.',
      visualizationType: 'matrix',
      visualizationData: {
        before: initialData.map((char) => ({ value: char, color: '#4ADE80' })),
        after: initialPermutation.map((char) => ({ value: char, color: '#60A5FA' })),
        operation: 'permutation'
      }
    });

    let currentData = initialPermutation.join('');
    
    // Key generation visualization
    const subkeys = [];
    for (let i = 0; i < 3; i++) {
      subkeys.push(key.split('').map(char => 
        String.fromCharCode((char.charCodeAt(0) + i) % 256)).join('')
      );
    }
    
    steps.push({
      id: 2,
      title: 'Step 2: Key Schedule Generation',
      description: 'Generate 16 subkeys from the main 56-bit key',
      input: key,
      output: subkeys.slice(0, 3).join(' → ') + ' → ... → K16',
      explanation: 'The main 56-bit key goes through permutation, shifting, and compression to generate 16 different 48-bit subkeys, one for each round.',
      visualizationType: 'diagram',
      visualizationData: {
        mainKey: { value: key, color: '#F472B6' },
        subkeys: subkeys.map((sk, i) => ({ value: sk, label: `K${i+1}`, color: '#C084FC' }))
      }
    });
    
    // Simulate 16 rounds (simplified to 3 for demo)
    for (let round = 1; round <= 3; round++) {
      const left = currentData.substring(0, 4);
      const right = currentData.substring(4);
      const newRight = left;
      
      // Expansion
      const expandedRight = right + right.charAt(0); // Simple expansion for demo
      
      steps.push({
        id: round + 2,
        title: `Step ${round + 2}: Round ${round} - Expansion`,
        description: `Expand the 32-bit right half to 48 bits for XOR with subkey ${round}`,
        input: `R${round-1}: ${right}`,
        output: `E(R${round-1}): ${expandedRight}`,
        explanation: `The 32-bit right half is expanded to 48 bits using an expansion permutation, repeating certain bits to match the subkey size.`,
        visualizationType: 'bits',
        visualizationData: {
          original: right.split('').map(char => ({ value: char, color: '#38BDF8' })),
          expanded: expandedRight.split('').map(char => ({ value: char, color: '#818CF8' }))
        }
      });
      
      // XOR with subkey
      const xorResult = expandedRight.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ subkeys[round-1].charAt(i % subkeys[round-1].length).charCodeAt(0))
      ).join('');
      
      steps.push({
        id: round + 2 + 0.1,
        title: `Step ${round + 2}.1: Round ${round} - Key XOR`,
        description: `XOR the expanded right half with subkey ${round}`,
        input: `E(R${round-1}): ${expandedRight} ⊕ K${round}: ${subkeys[round-1]}`,
        output: xorResult,
        explanation: `The expanded right half is XORed with the round subkey, introducing key-dependent transformation.`,
        visualizationType: 'diagram',
        visualizationData: {
          operation: 'xor',
          left: { value: expandedRight, label: `E(R${round-1})`, color: '#818CF8' },
          right: { value: subkeys[round-1], label: `K${round}`, color: '#C084FC' },
          result: { value: xorResult, label: 'XOR Result', color: '#FB923C' }
        }
      });
      
      // S-Box substitution
      const substituted = xorResult.split('').map((char, i) => 
        String.fromCharCode((char.charCodeAt(0) + i + round) % 256)
      ).join('');
      
      steps.push({
        id: round + 2 + 0.2,
        title: `Step ${round + 2}.2: Round ${round} - S-Box Substitution`,
        description: 'Apply the DES S-box substitution to get a 32-bit result',
        input: xorResult,
        output: substituted,
        explanation: 'The 48-bit XOR result is divided into 8 blocks of 6 bits each. Each block passes through a specific S-box that transforms 6 bits into 4 bits based on non-linear substitution rules.',
        visualizationType: 'matrix',
        visualizationData: {
          before: xorResult.split('').map(char => ({ value: char, color: '#FB923C' })),
          after: substituted.split('').map(char => ({ value: char, color: '#FBBF24' })),
          operation: 'substitution'
        }
      });
      
      // P-Box permutation
      const permuted = substituted.split('').reverse().join('');
      
      steps.push({
        id: round + 2 + 0.3,
        title: `Step ${round + 2}.3: Round ${round} - P-Box Permutation`,
        description: 'Permute the S-box output for diffusion',
        input: substituted,
        output: permuted,
        explanation: 'The 32-bit S-box output undergoes a permutation that rearranges the bits to provide diffusion, spreading the influence of each input bit.',
        visualizationType: 'bits',
        visualizationData: {
          original: substituted.split('').map(char => ({ value: char, color: '#FBBF24' })),
          permuted: permuted.split('').map(char => ({ value: char, color: '#34D399' }))
        }
      });
      
      // Final XOR with left half
      const newLeft = right.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ permuted.charAt(i % permuted.length).charCodeAt(0))
      ).join('');
      
      steps.push({
        id: round + 2 + 0.4,
        title: `Step ${round + 2}.4: Round ${round} - Feistel Function Result`,
        description: `Complete round ${round} with L${round} = R${round-1} and R${round} = L${round-1} ⊕ f(R${round-1}, K${round})`,
        input: `L${round-1}: ${left}, R${round-1}: ${right}`,
        output: `L${round}: ${newLeft}, R${round}: ${newRight}`,
        explanation: `The Feistel structure: the new left half becomes the previous right half, and the new right half is the XOR of the previous left half with the function output.`,
        visualizationType: 'diagram',
        visualizationData: {
          structure: 'feistel',
          leftBefore: { value: left, label: `L${round-1}`, color: '#2DD4BF' },
          rightBefore: { value: right, label: `R${round-1}`, color: '#38BDF8' },
          function: { value: permuted, label: `f(R${round-1}, K${round})`, color: '#34D399' },
          leftAfter: { value: newLeft, label: `L${round}`, color: '#2DD4BF' },
          rightAfter: { value: newRight, label: `R${round}`, color: '#38BDF8' }
        }
      });
      
      currentData = newLeft + newRight;
    }

    // Final permutation
    const finalResult = currentData.split('').reverse().join('');
    
    steps.push({
      id: steps.length + 1,
      title: 'Final Step: Reverse Initial Permutation (IP⁻¹)',
      description: 'Apply the final permutation (inverse of initial permutation)',
      input: currentData,
      output: action === 'encrypt' ? 
        Buffer.from(finalResult).toString('base64').substring(0, 12) + '...' : finalResult,
      explanation: 'The 64-bit result after all rounds undergoes the inverse permutation of the initial permutation, producing the final output.',
      visualizationType: 'matrix',
      visualizationData: {
        before: currentData.split('').map(char => ({ value: char, color: '#60A5FA' })),
        after: finalResult.split('').map(char => ({ value: char, color: '#4ADE80' })),
        operation: 'permutation',
        final: true
      }
    });

    return steps;
  };

  const generateAESSteps = (input: string, action: Action): Step[] => {
    const steps: Step[] = [];
    const key = "CRYPTOGRAPHY_KEY"; // A sample 16-byte key (simplified)
    
    // Simplified AES demonstration
    const paddedInput = input.padEnd(16, ' ').substring(0, 16);
    
    // Format the input as a 4x4 matrix for visualization
    const initialStateMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j;
        if (index < paddedInput.length) {
          row.push(paddedInput[index]);
        } else {
          row.push(' ');
        }
      }
      initialStateMatrix.push(row);
    }
    
    steps.push({
      id: 1,
      title: 'Step 1: Convert Input to State Matrix',
      description: 'Arrange the input bytes into a 4×4 matrix called the state',
      input: paddedInput,
      output: initialStateMatrix.map(row => row.join('')).join('\n'),
      explanation: 'AES processes data in blocks of 16 bytes. These bytes are arranged into a 4×4 matrix called the state.',
      visualizationType: 'matrix',
      visualizationData: {
        matrix: initialStateMatrix.map(row => 
          row.map(cell => ({ value: cell, color: '#4ADE80' }))
        )
      }
    });
    
    // Key expansion visualization
    const keyBytes = key.split('');
    const keyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j;
        if (index < keyBytes.length) {
          row.push(keyBytes[index]);
        } else {
          row.push('0');
        }
      }
      keyMatrix.push(row);
    }
    
    steps.push({
      id: 2,
      title: 'Step 2: Key Expansion',
      description: 'Expand the key into a key schedule for all rounds',
      input: key.substring(0, 16),
      output: "Key schedule generated for all rounds",
      explanation: 'The AES key (128/192/256 bits) is expanded to generate round keys for each round of encryption.',
      visualizationType: 'matrix',
      visualizationData: {
        matrix: keyMatrix.map(row => 
          row.map(cell => ({ value: cell, color: '#F472B6' }))
        ),
        title: 'Initial Key Matrix'
      }
    });
    
    // Initial AddRoundKey
    const afterAddRoundKey = paddedInput.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ (key.charCodeAt(i % key.length)))
    ).join('');
    
    const afterAddRoundKeyMatrix = [];
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        const index = i * 4 + j;
        if (index < afterAddRoundKey.length) {
          row.push(afterAddRoundKey[index]);
        } else {
          row.push(' ');
        }
      }
      afterAddRoundKeyMatrix.push(row);
    }
    
    steps.push({
      id: 3,
      title: 'Step 3: Initial AddRoundKey',
      description: 'XOR the state with the initial round key',
      input: paddedInput,
      output: afterAddRoundKey,
      explanation: 'Before the main rounds begin, the state is XORed with the initial round key (derived from the main key).',
      visualizationType: 'diagram',
      visualizationData: {
        operation: 'xor',
        left: { 
          matrix: initialStateMatrix.map(row => 
            row.map(cell => ({ value: cell, color: '#4ADE80' }))
          ),
          label: 'Initial State' 
        },
        right: { 
          matrix: keyMatrix.map(row => 
            row.map(cell => ({ value: cell, color: '#F472B6' }))
          ),
          label: 'Round Key 0' 
        },
        result: { 
          matrix: afterAddRoundKeyMatrix.map(row => 
            row.map(cell => ({ value: cell, color: '#60A5FA' }))
          ),
          label: 'After AddRoundKey' 
        }
      }
    });
    
    let currentState = afterAddRoundKey;

    // Main AES rounds (showing 3 for simplicity)
    for (let round = 1; round <= 3; round++) {
      // SubBytes
      const afterSubBytes = currentState.split('').map(char => 
        String.fromCharCode(((char.charCodeAt(0) + round) % 256))
      ).join('');
      
      const afterSubBytesMatrix = [];
      for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
          const index = i * 4 + j;
          if (index < afterSubBytes.length) {
            row.push(afterSubBytes[index]);
          } else {
            row.push(' ');
          }
        }
        afterSubBytesMatrix.push(row);
      }
      
      steps.push({
        id: steps.length + 1,
        title: `Step ${steps.length + 1}: SubBytes (Round ${round})`,
        description: 'Substitute each byte using the AES S-box',
        input: currentState,
        output: afterSubBytes,
        explanation: 'Each byte in the state is replaced with its corresponding value in the AES S-box, a non-linear substitution table.',
        visualizationType: 'matrix',
        visualizationData: {
          before: currentState.split('').map((char, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            return { 
              value: char, 
              color: '#60A5FA',
              position: { row, col }
            };
          }),
          after: afterSubBytes.split('').map((char, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            return { 
              value: char, 
              color: '#818CF8',
              position: { row, col }
            };
          }),
          operation: 'substitution',
          matrix: afterSubBytesMatrix.map(row => 
            row.map(cell => ({ value: cell, color: '#818CF8' }))
          )
        }
      });

      // ShiftRows
      const stateChars = afterSubBytes.split('');
      let afterShiftRows = '';
      
      // Perform the actual ShiftRows operation
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const newCol = (col + row) % 4; // Shift based on row number
          const originalIndex = row * 4 + col;
          const newIndex = row * 4 + newCol;
          if (newIndex < stateChars.length) {
            afterShiftRows += stateChars[originalIndex];
          }
        }
      }
      
      const shiftRowsVisualizationData = {
        before: afterSubBytesMatrix,
        after: [],
        shifts: [0, 1, 2, 3]
      };
      
      // Create shifted matrix for visualization
      const afterShiftRowsMatrix = [];
      for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
          const originalCol = (j - i + 4) % 4; // Reverse the shift to find original position
          const index = i * 4 + originalCol;
          if (index < afterSubBytes.length) {
            row.push(afterSubBytes[index]);
          } else {
            row.push(' ');
          }
        }
        afterShiftRowsMatrix.push(row);
        // Store for visualization
        shiftRowsVisualizationData.after.push(
          row.map(cell => ({ value: cell, color: '#C084FC' }))
        );
      }
      
      steps.push({
        id: steps.length + 1,
        title: `Step ${steps.length + 1}: ShiftRows (Round ${round})`,
        description: 'Shift each row of the state to the left by different offsets',
        input: afterSubBytes,
        output: afterShiftRows,
        explanation: 'Row 0 is not shifted, row 1 is shifted left by 1, row 2 by 2, and row 3 by 3 positions.',
        visualizationType: 'matrix',
        visualizationData: {
          before: afterSubBytesMatrix.map(row => 
            row.map(cell => ({ value: cell, color: '#818CF8' }))
          ),
          after: afterShiftRowsMatrix.map(row => 
            row.map(cell => ({ value: cell, color: '#C084FC' }))
          ),
          operation: 'shiftRows',
          shifts: [0, 1, 2, 3]
        }
      });

      // MixColumns (skip in last round)
      if (round < 3) {
        const afterMixColumns = afterShiftRows.split('').map((char, i) => 
          String.fromCharCode((char.charCodeAt(0) * 2 + round) % 256)
        ).join('');
        
        const afterMixColumnsMatrix = [];
        for (let i = 0; i < 4; i++) {
          const row = [];
          for (let j = 0; j < 4; j++) {
            const index = i * 4 + j;
            if (index < afterMixColumns.length) {
              row.push(afterMixColumns[index]);
            } else {
              row.push(' ');
            }
          }
          afterMixColumnsMatrix.push(row);
        }
        
        steps.push({
          id: steps.length + 1,
          title: `Step ${steps.length + 1}: MixColumns (Round ${round})`,
          description: 'Mix the columns of the state for diffusion',
          input: afterShiftRows,
          output: afterMixColumns,
          explanation: 'Each column of the state is multiplied by a fixed polynomial in the Galois Field GF(2^8), providing strong diffusion.',
          visualizationType: 'matrix',
          visualizationData: {
            operation: 'mixColumns',
            before: afterShiftRowsMatrix.map(row => 
              row.map(cell => ({ value: cell, color: '#C084FC' }))
            ),
            after: afterMixColumnsMatrix.map(row => 
              row.map(cell => ({ value: cell, color: '#FB923C' }))
            )
          }
        });
        
        currentState = afterMixColumns;
      } else {
        currentState = afterShiftRows;
      }

      // AddRoundKey
      const roundKey = key.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ (0x2B + round + i))
      ).join('');
      
      const roundKeyMatrix = [];
      for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
          const index = i * 4 + j;
          if (index < roundKey.length) {
            row.push(roundKey[index]);
          } else {
            row.push('0');
          }
        }
        roundKeyMatrix.push(row);
      }
      
      const afterAddRoundKey = currentState.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ roundKey.charCodeAt(i % roundKey.length))
      ).join('');
      
      const finalAddRoundKeyMatrix = [];
      for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
          const index = i * 4 + j;
          if (index < afterAddRoundKey.length) {
            row.push(afterAddRoundKey[index]);
          } else {
            row.push(' ');
          }
        }
        finalAddRoundKeyMatrix.push(row);
      }
      
      steps.push({
        id: steps.length + 1,
        title: `Step ${steps.length + 1}: AddRoundKey (Round ${round})`,
        description: `XOR with round ${round} key`,
        input: currentState,
        output: afterAddRoundKey,
        explanation: `The state is XORed with the round key for round ${round}, derived from the key schedule.`,
        visualizationType: 'diagram',
        visualizationData: {
          operation: 'xor',
          left: { 
            matrix: (round < 3) ? 
              afterMixColumnsMatrix.map(row => row.map(cell => ({ value: cell, color: '#FB923C' }))) : 
              afterShiftRowsMatrix.map(row => row.map(cell => ({ value: cell, color: '#C084FC' }))),
            label: 'Current State' 
          },
          right: { 
            matrix: roundKeyMatrix.map(row => row.map(cell => ({ value: cell, color: '#F472B6' }))),
            label: `Round Key ${round}` 
          },
          result: { 
            matrix: finalAddRoundKeyMatrix.map(row => row.map(cell => ({ value: cell, color: '#2DD4BF' }))),
            label: 'After AddRoundKey' 
          }
        }
      });
      
      currentState = afterAddRoundKey;
    }

    // Final result
    const finalResult = action === 'encrypt' ? 
      Buffer.from(currentState).toString('base64') : currentState;
    
    steps[steps.length - 1].output = finalResult;

    return steps;
  };

  const renderVisualization = (step: Step) => {
    if (!step.visualizationType || !step.visualizationData) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="font-mono text-sm whitespace-pre-line">
            {step.visualization || "No visualization available"}
          </div>
        </div>
      );
    }

    switch (step.visualizationType) {
      case 'matrix':
        return renderMatrixVisualization(step);
      case 'bits':
        return renderBitsVisualization(step);
      case 'diagram':
        return renderDiagramVisualization(step);
      default:
        return (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="font-mono text-sm whitespace-pre-line">
              {step.visualization || "No visualization available"}
            </div>
          </div>
        );
    }
  };

  const renderMatrixVisualization = (step: Step) => {
    const { visualizationData } = step;
    
    if (visualizationData.operation === 'shiftRows') {
      return (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-6 rounded-lg border border-violet-200 shadow-sm">
          <h4 className="font-medium text-indigo-900 mb-4 text-center">ShiftRows Transformation</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-indigo-700 mb-2 text-center">Before ShiftRows</h5>
              <div className="grid grid-cols-4 gap-1 bg-white p-3 rounded-md shadow-inner">
                {visualizationData.before.map((row: any[], rowIndex: number) => 
                  row.map((cell: any, colIndex: number) => (
                    <div 
                      key={`before-${rowIndex}-${colIndex}`} 
                      className="w-12 h-12 flex items-center justify-center rounded-md"
                      style={{ backgroundColor: '#818CF8', color: 'white' }}
                    >
                      {cell.value}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-indigo-700 mb-2 text-center">After ShiftRows</h5>
              <div className="grid grid-cols-4 gap-1 bg-white p-3 rounded-md shadow-inner">
                {visualizationData.after.map((row: any[], rowIndex: number) => {
                  const shift = visualizationData.shifts[rowIndex];
                  return row.map((cell: any, colIndex: number) => (
                    <div 
                      key={`after-${rowIndex}-${colIndex}`} 
                      className={`w-12 h-12 flex items-center justify-center rounded-md ${rowIndex > 0 ? 'animate-fade-in' : ''}`}
                      style={{ 
                        backgroundColor: '#C084FC', 
                        color: 'white',
                        animationDelay: `${rowIndex * 0.2}s`,
                        position: 'relative'
                      }}
                    >
                      {cell.value}
                      {rowIndex > 0 && (
                        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
                          <div className="text-indigo-600 text-xs font-mono">
                            ← {shift}
                          </div>
                        </div>
                      )}
                    </div>
                  ));
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-indigo-700 text-center">
            Each row is cyclically shifted left by its row number (0, 1, 2, or 3 positions)
          </div>
        </div>
      );
    }
    
    if (visualizationData.operation === 'mixColumns') {
      return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border border-orange-200 shadow-sm">
          <h4 className="font-medium text-orange-900 mb-4 text-center">MixColumns Transformation</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-orange-700 mb-2 text-center">Before MixColumns</h5>
              <div className="grid grid-cols-4 gap-1 bg-white p-3 rounded-md shadow-inner">
                {visualizationData.before.map((row: any[], rowIndex: number) => 
                  row.map((cell: any, colIndex: number) => (
                    <div 
                      key={`before-${rowIndex}-${colIndex}`} 
                      className="w-12 h-12 flex items-center justify-center rounded-md"
                      style={{ backgroundColor: '#C084FC', color: 'white' }}
                    >
                      {cell.value}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-orange-700 mb-2 text-center">After MixColumns</h5>
              <div className="grid grid-cols-4 gap-1 bg-white p-3 rounded-md shadow-inner">
                {visualizationData.after.map((row: any[], rowIndex: number) => 
                  row.map((cell: any, colIndex: number) => (
                    <div 
                      key={`after-${rowIndex}-${colIndex}`} 
                      className="w-12 h-12 flex items-center justify-center rounded-md animate-fade-in"
                      style={{ 
                        backgroundColor: '#FB923C', 
                        color: 'white',
                        animationDelay: `${colIndex * 0.2}s`
                      }}
                    >
                      {cell.value}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-orange-700 text-center">
            Each column is multiplied by a fixed polynomial c(x) = 3x³ + x² + x + 2 in GF(2⁸)
          </div>
        </div>
      );
    }
    
    if (visualizationData.operation === 'substitution') {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 shadow-sm">
          <h4 className="font-medium text-blue-900 mb-4 text-center">S-box Substitution</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-blue-700 mb-2 text-center">Before Substitution</h5>
              <div className="flex flex-wrap justify-center gap-2 bg-white p-4 rounded-md shadow-inner">
                {visualizationData.before.map((item: any, index: number) => (
                  <div 
                    key={`before-${index}`} 
                    className="w-12 h-12 flex items-center justify-center rounded-md"
                    style={{ backgroundColor: item.color, color: 'white' }}
                  >
                    {item.value}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-blue-700 mb-2 text-center">After Substitution</h5>
              <div className="flex flex-wrap justify-center gap-2 bg-white p-4 rounded-md shadow-inner">
                {visualizationData.after.map((item: any, index: number) => (
                  <div 
                    key={`after-${index}`} 
                    className="w-12 h-12 flex items-center justify-center rounded-md animate-fade-in"
                    style={{ 
                      backgroundColor: item.color, 
                      color: 'white',
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    {item.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-700 text-center">
            Each byte is replaced with a corresponding value from the S-box lookup table
          </div>
        </div>
      );
    }
    
    if (visualizationData.operation === 'permutation') {
      return (
        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg border border-green-200 shadow-sm">
          <h4 className="font-medium text-green-900 mb-4 text-center">
            {visualizationData.final ? 'Final Permutation' : 'Initial Permutation'}
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-green-700 mb-2 text-center">Before Permutation</h5>
              <div className="flex flex-wrap justify-center gap-2 bg-white p-4 rounded-md shadow-inner">
                {visualizationData.before.map((item: any, index: number) => (
                  <div 
                    key={`before-${index}`} 
                    className="w-12 h-12 flex items-center justify-center rounded-md"
                    style={{ backgroundColor: item.color, color: 'white' }}
                  >
                    {item.value}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-green-700 mb-2 text-center">After Permutation</h5>
              <div className="flex flex-wrap justify-center gap-2 bg-white p-4 rounded-md shadow-inner">
                {visualizationData.after.map((item: any, index: number) => (
                  <div 
                    key={`after-${index}`} 
                    className="w-12 h-12 flex items-center justify-center rounded-md animate-fade-in"
                    style={{ 
                      backgroundColor: item.color, 
                      color: 'white',
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    {item.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-700 text-center">
            {visualizationData.final 
              ? 'The final permutation is the inverse of the initial permutation' 
              : 'The initial permutation rearranges the input bits in a fixed pattern'}
          </div>
        </div>
      );
    }
    
    // Default matrix visualization
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-lg border border-slate-200 shadow-sm">
        <h4 className="font-medium text-slate-900 mb-4 text-center">Matrix Representation</h4>
        <div className="bg-white p-4 rounded-md shadow-inner">
          <div className="grid grid-cols-4 gap-2">
            {visualizationData.matrix.map((row: any[], rowIndex: number) => 
              row.map((cell: any, colIndex: number) => (
                <div 
                  key={`matrix-${rowIndex}-${colIndex}`} 
                  className="w-12 h-12 flex items-center justify-center rounded-md"
                  style={{ backgroundColor: cell.color || '#60A5FA', color: 'white' }}
                >
                  {cell.value}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-700 text-center">
          {visualizationData.title || "4×4 Matrix Representation"}
        </div>
      </div>
    );
  };

  const renderBitsVisualization = (step: Step) => {
    const { visualizationData } = step;
    
    return (
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-200 shadow-sm">
        <h4 className="font-medium text-cyan-900 mb-4 text-center">
          {step.title.includes('Expansion') ? 'Bit Expansion' : 'Bit Permutation'}
        </h4>
        <div className="space-y-6">
          <div>
            <h5 className="text-sm font-medium text-cyan-700 mb-2 text-center">Original</h5>
            <div className="flex flex-wrap justify-center gap-2 bg-white p-4 rounded-md shadow-inner">
              {visualizationData.original.map((bit: any, index: number) => (
                <div 
                  key={`original-${index}`} 
                  className="w-10 h-10 flex items-center justify-center rounded-md"
                  style={{ backgroundColor: bit.color, color: 'white' }}
                >
                  {bit.value}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center">
            <ArrowDown className="text-cyan-500 w-6 h-6" />
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-cyan-700 mb-2 text-center">
              {step.title.includes('Expansion') ? 'Expanded' : 'Permuted'}
            </h5>
            <div className="flex flex-wrap justify-center gap-2 bg-white p-4 rounded-md shadow-inner">
              {visualizationData[step.title.includes('Expansion') ? 'expanded' : 'permuted'].map((bit: any, index: number) => (
                <div 
                  key={`modified-${index}`} 
                  className="w-10 h-10 flex items-center justify-center rounded-md animate-fade-in"
                  style={{ 
                    backgroundColor: bit.color, 
                    color: 'white',
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  {bit.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDiagramVisualization = (step: Step) => {
    const { visualizationData } = step;
    
    if (visualizationData.operation === 'xor') {
      return (
        <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 p-6 rounded-lg border border-fuchsia-200 shadow-sm">
          <h4 className="font-medium text-fuchsia-900 mb-4 text-center">XOR Operation</h4>
          
          {visualizationData.left.matrix && visualizationData.right.matrix ? (
            // Matrix XOR visualization
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h5 className="text-sm font-medium text-fuchsia-700 mb-2 text-center">{visualizationData.left.label}</h5>
                <div className="bg-white p-3 rounded-md shadow-inner">
                  <div className="grid grid-cols-4 gap-1">
                    {visualizationData.left.matrix.map((row: any[], rowIndex: number) => 
                      row.map((cell: any, colIndex: number) => (
                        <div 
                          key={`left-${rowIndex}-${colIndex}`} 
                          className="w-10 h-10 flex items-center justify-center rounded-md"
                          style={{ backgroundColor: cell.color || '#FB923C', color: 'white' }}
                        >
                          {cell.value}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                    <span className="text-pink-800 font-bold">XOR</span>
                  </div>
                  <div className="w-full flex items-center justify-center">
                    <div className="h-0.5 w-16 bg-pink-400"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-fuchsia-700 mb-2 text-center">{visualizationData.right.label}</h5>
                <div className="bg-white p-3 rounded-md shadow-inner">
                  <div className="grid grid-cols-4 gap-1">
                    {visualizationData.right.matrix.map((row: any[], rowIndex: number) => 
                      row.map((cell: any, colIndex: number) => (
                        <div 
                          key={`right-${rowIndex}-${colIndex}`} 
                          className="w-10 h-10 flex items-center justify-center rounded-md"
                          style={{ backgroundColor: cell.color || '#F472B6', color: 'white' }}
                        >
                          {cell.value}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // String XOR visualization
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h5 className="text-sm font-medium text-fuchsia-700 mb-2 text-center">{visualizationData.left.label}</h5>
                <div className="bg-white p-3 rounded-md shadow-inner flex justify-center">
                  <div className="font-mono text-sm break-all p-2 bg-indigo-100 rounded">
                    {visualizationData.left.value}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                    <span className="text-pink-800 font-bold">XOR</span>
                  </div>
                  <div className="w-full flex items-center justify-center">
                    <div className="h-0.5 w-16 bg-pink-400"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-fuchsia-700 mb-2 text-center">{visualizationData.right.label}</h5>
                <div className="bg-white p-3 rounded-md shadow-inner flex justify-center">
                  <div className="font-mono text-sm break-all p-2 bg-pink-100 rounded">
                    {visualizationData.right.value}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-center items-center">
            <ArrowDown className="text-pink-500 w-6 h-6" />
          </div>
          
          <div className="mt-4">
            <h5 className="text-sm font-medium text-fuchsia-700 mb-2 text-center">{visualizationData.result.label}</h5>
            
            {visualizationData.result.matrix ? (
              <div className="bg-white p-3 rounded-md shadow-inner mx-auto max-w-xs">
                <div className="grid grid-cols-4 gap-1">
                  {visualizationData.result.matrix.map((row: any[], rowIndex: number) => 
                    row.map((cell: any, colIndex: number) => (
                      <div 
                        key={`result-${rowIndex}-${colIndex}`} 
                        className="w-10 h-10 flex items-center justify-center rounded-md animate-fade-in"
                        style={{ 
                          backgroundColor: cell.color || '#2DD4BF', 
                          color: 'white',
                          animationDelay: `${(rowIndex * 4 + colIndex) * 0.05}s`
                        }}
                      >
                        {cell.value}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-md shadow-inner flex justify-center">
                <div className="font-mono text-sm break-all p-2 bg-teal-100 rounded animate-fade-in">
                  {visualizationData.result.value}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (visualizationData.structure === 'feistel') {
      return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-200 shadow-sm">
          <h4 className="font-medium text-emerald-900 mb-4 text-center">Feistel Round Structure</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <h5 className="text-sm font-medium text-emerald-700 mb-2 text-center">Before Round</h5>
              <div className="flex gap-6 justify-center">
                <div>
                  <div className="text-xs text-center text-emerald-700 mb-1">{visualizationData.leftBefore.label}</div>
                  <div 
                    className="w-16 h-16 flex items-center justify-center rounded-md shadow-sm"
                    style={{ backgroundColor: '#2DD4BF', color: 'white' }}
                  >
                    {visualizationData.leftBefore.value}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-center text-emerald-700 mb-1">{visualizationData.rightBefore.label}</div>
                  <div 
                    className="w-16 h-16 flex items-center justify-center rounded-md shadow-sm"
                    style={{ backgroundColor: '#38BDF8', color: 'white' }}
                  >
                    {visualizationData.rightBefore.value}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-emerald-700 mb-2 text-center">After Round</h5>
              <div className="flex gap-6 justify-center">
                <div>
                  <div className="text-xs text-center text-emerald-700 mb-1">{visualizationData.leftAfter.label}</div>
                  <div 
                    className="w-16 h-16 flex items-center justify-center rounded-md shadow-sm animate-fade-in"
                    style={{ backgroundColor: '#2DD4BF', color: 'white' }}
                  >
                    {visualizationData.leftAfter.value}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-center text-emerald-700 mb-1">{visualizationData.rightAfter.label}</div>
                  <div 
                    className="w-16 h-16 flex items-center justify-center rounded-md shadow-sm animate-fade-in"
                    style={{ backgroundColor: '#38BDF8', color: 'white', animationDelay: '0.2s' }}
                  >
                    {visualizationData.rightAfter.value}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow-inner">
            <div className="flex items-center gap-3 justify-center">
              <div 
                className="w-16 h-16 flex items-center justify-center rounded-md"
                style={{ backgroundColor: '#38BDF8', color: 'white' }}
              >
                {visualizationData.rightBefore.value}
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-700" />
              <div 
                className="w-16 h-16 flex items-center justify-center rounded-md"
                style={{ backgroundColor: '#34D399', color: 'white' }}
              >
                {visualizationData.function.value}
              </div>
              <div className="relative">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-800 font-bold">XOR</span>
                </div>
                <div className="w-full flex items-center justify-center">
                  <div className="h-0.5 w-10 bg-emerald-400"></div>
                </div>
              </div>
              <div 
                className="w-16 h-16 flex items-center justify-center rounded-md"
                style={{ backgroundColor: '#2DD4BF', color: 'white' }}
              >
                {visualizationData.leftBefore.value}
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-700" />
              <div 
                className="w-16 h-16 flex items-center justify-center rounded-md animate-fade-in"
                style={{ backgroundColor: '#2DD4BF', color: 'white', animationDelay: '0.3s' }}
              >
                {visualizationData.leftAfter.value}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-emerald-700 text-center">
            L{step.title.match(/Round (\d+)/)?.[1]} = R{Number(step.title.match(/Round (\d+)/)?.[1])-1} and 
            R{step.title.match(/Round (\d+)/)?.[1]} = L{Number(step.title.match(/Round (\d+)/)?.[1])-1} ⊕ f(R{Number(step.title.match(/Round (\d+)/)?.[1])-1}, K{step.title.match(/Round (\d+)/)?.[1]})
          </div>
        </div>
      );
    }
    
    // Default diagram visualization for key schedule
    if (visualizationData.mainKey && visualizationData.subkeys) {
      return (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-lg border border-rose-200 shadow-sm">
          <h4 className="font-medium text-rose-900 mb-4 text-center">Key Schedule Generation</h4>
          
          <div className="mb-6">
            <h5 className="text-sm font-medium text-rose-700 mb-2 text-center">Main Key</h5>
            <div className="bg-white p-3 rounded-md shadow-inner flex justify-center">
              <div 
                className="px-6 py-3 rounded-md flex items-center justify-center"
                style={{ backgroundColor: visualizationData.mainKey.color, color: 'white' }}
              >
                <Key className="w-5 h-5 mr-2" /> 
                <span className="font-mono">{visualizationData.mainKey.value}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <ArrowDown className="text-rose-500 w-6 h-6" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {visualizationData.subkeys.map((subkey: any, index: number) => (
              <div key={`subkey-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="text-xs text-center text-rose-700 mb-1">{subkey.label}</div>
                <div 
                  className="px-4 py-2 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: subkey.color, color: 'white' }}
                >
                  <Key className="w-4 h-4 mr-1" /> 
                  <span className="font-mono text-sm">{subkey.value}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-rose-700 text-center">
            Key schedule generation applies permutations and rotations to derive round keys
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
        <h4 className="font-medium text-blue-900 mb-4 text-center">Process Diagram</h4>
        <div className="bg-white p-4 rounded-md shadow-inner">
          <div className="font-mono text-sm whitespace-pre-line">
            {step.visualization || "Diagram visualization"}
          </div>
        </div>
      </div>
    );
  };

  const renderAltVisualization = (step: Step) => {
    if (algorithm === 'aes') {
      return renderAesAltVisualization(step);
    } else if (algorithm === 'des') {
      return renderDesAltVisualization(step);
    }
    return null;
  };

  const renderAesAltVisualization = (step: Step) => {
    if (!step.visualizationType) return null;
    
    if (step.title.includes('SubBytes')) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-4 text-center">SubBytes Transformation</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-mono text-blue-700">A</span>
                </div>
                <ArrowDown className="text-blue-500 w-5 h-5 my-2" />
                <div className="w-16 h-16 bg-indigo-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-mono text-indigo-700">B</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-blue-800">
              <h5 className="font-medium mb-2">How SubBytes Works:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>Each byte is treated as a point in GF(2⁸)</li>
                <li>Takes the multiplicative inverse (in GF(2⁸))</li>
                <li>Applies an affine transformation</li>
                <li>Provides confusion to the cipher</li>
                <li>Non-linear operation to prevent algebraic attacks</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    
    if (step.title.includes('ShiftRows')) {
      return (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-lg border border-indigo-200">
          <h4 className="font-medium text-indigo-900 mb-4 text-center">ShiftRows Patterns</h4>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xs font-medium text-indigo-700 mb-1">Row 0</div>
              <div className="flex">
                <div className="w-8 h-8 bg-indigo-200 rounded-l-md flex items-center justify-center text-indigo-800">a</div>
                <div className="w-8 h-8 bg-indigo-200 flex items-center justify-center text-indigo-800">b</div>
                <div className="w-8 h-8 bg-indigo-200 flex items-center justify-center text-indigo-800">c</div>
                <div className="w-8 h-8 bg-indigo-200 rounded-r-md flex items-center justify-center text-indigo-800">d</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-indigo-700 mb-1">Row 1</div>
              <div className="flex">
                <div className="w-8 h-8 bg-violet-200 rounded-l-md flex items-center justify-center text-violet-800">b</div>
                <div className="w-8 h-8 bg-violet-200 flex items-center justify-center text-violet-800">c</div>
                <div className="w-8 h-8 bg-violet-200 flex items-center justify-center text-violet-800">d</div>
                <div className="w-8 h-8 bg-violet-200 rounded-r-md flex items-center justify-center text-violet-800">a</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-indigo-700 mb-1">Row 2</div>
              <div className="flex">
                <div className="w-8 h-8 bg-purple-200 rounded-l-md flex items-center justify-center text-purple-800">c</div>
                <div className="w-8 h-8 bg-purple-200 flex items-center justify-center text-purple-800">d</div>
                <div className="w-8 h-8 bg-purple-200 flex items-center justify-center text-purple-800">a</div>
                <div className="w-8 h-8 bg-purple-200 rounded-r-md flex items-center justify-center text-purple-800">b</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-indigo-700 mb-1">Row 3</div>
              <div className="flex">
                <div className="w-8 h-8 bg-fuchsia-200 rounded-l-md flex items-center justify-center text-fuchsia-800">d</div>
                <div className="w-8 h-8 bg-fuchsia-200 flex items-center justify-center text-fuchsia-800">a</div>
                <div className="w-8 h-8 bg-fuchsia-200 flex items-center justify-center text-fuchsia-800">b</div>
                <div className="w-8 h-8 bg-fuchsia-200 rounded-r-md flex items-center justify-center text-fuchsia-800">c</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-indigo-800">
            <p>ShiftRows shifts each row cyclically to the left by a certain offset. Row 0 is not shifted, row 1 by 1, row 2 by 2, and row 3 by 3 positions. This ensures that each column of the output state depends on all columns of the input state.</p>
          </div>
        </div>
      );
    }
    
    if (step.title.includes('MixColumns')) {
      return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
          <h4 className="font-medium text-orange-900 mb-4 text-center">MixColumns Operation</h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
              <div className="grid grid-cols-2 gap-1 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-tl-md flex items-center justify-center text-amber-800">a</div>
                <div className="w-10 h-10 bg-amber-100 rounded-tr-md flex items-center justify-center text-amber-800">e</div>
                <div className="w-10 h-10 bg-amber-100 rounded-bl-md flex items-center justify-center text-amber-800">i</div>
                <div className="w-10 h-10 bg-amber-100 rounded-br-md flex items-center justify-center text-amber-800">m</div>
              </div>
              <ArrowDown className="text-amber-500 w-5 h-5 my-2" />
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="w-10 h-10 bg-orange-200 rounded-tl-md flex items-center justify-center text-orange-800">x</div>
                <div className="w-10 h-10 bg-orange-200 rounded-tr-md flex items-center justify-center text-orange-800">y</div>
                <div className="w-10 h-10 bg-orange-200 rounded-bl-md flex items-center justify-center text-orange-800">z</div>
                <div className="w-10 h-10 bg-orange-200 rounded-br-md flex items-center justify-center text-orange-800">w</div>
              </div>
            </div>
            <div className="text-sm text-orange-800">
              <h5 className="font-medium mb-2">MixColumns Transformation:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>Each column is treated as a four-term polynomial</li>
                <li>Multiplied by a fixed polynomial c(x)</li>
                <li>c(x) = 3x³ + x² + x + 2</li>
                <li>Operation performed in GF(2⁸)</li>
                <li>Provides diffusion in the cipher</li>
                <li>All output bytes depend on all input bytes</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  const renderDesAltVisualization = (step: Step) => {
    if (!step.visualizationType) return null;
    
    if (step.title.includes('Initial Permutation')) {
      return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-4 text-center">Initial Permutation Properties</h4>
          <div className="text-sm text-green-800 space-y-2">
            <p>The Initial Permutation (IP) is the first step in DES encryption. It's a fixed permutation of the 64-bit input block that:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Does not provide cryptographic strength</li>
              <li>Was designed for hardware optimization in the 1970s</li>
              <li>Rearranges bits in a predefined order</li>
              <li>Separates data into left and right 32-bit halves</li>
              <li>Is reversed by the final permutation at the end</li>
            </ul>
          </div>
        </div>
      );
    }
    
    if (step.title.includes('Key Schedule')) {
      return (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg border border-pink-200">
          <h4 className="font-medium text-pink-900 mb-4 text-center">DES Key Schedule Process</h4>
          <div className="flex items-center justify-center mb-6">
            <div>
              <div className="w-20 h-10 bg-pink-200 rounded-md flex items-center justify-center mb-2">
                <Lock className="w-4 h-4 mr-1 text-pink-700" />
                <span className="text-sm text-pink-800">56-bit key</span>
              </div>
            </div>
            <ArrowRight className="mx-4 text-pink-400" />
            <div className="flex flex-col items-center">
              <div className="w-20 h-8 bg-rose-100 rounded-md flex items-center justify-center mb-2">
                <span className="text-xs text-rose-800">PC-1</span>
              </div>
              <span className="text-xs text-rose-700">Permutation</span>
            </div>
            <ArrowRight className="mx-4 text-pink-400" />
            <div className="flex flex-col gap-2">
              <div className="w-20 h-8 bg-rose-200 rounded-md flex items-center justify-center">
                <span className="text-xs text-rose-800">C₀ (28 bits)</span>
              </div>
              <div className="w-20 h-8 bg-rose-200 rounded-md flex items-center justify-center">
                <span className="text-xs text-rose-800">D₀ (28 bits)</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-pink-800">
            <h5 className="font-medium mb-2">For each of the 16 rounds:</h5>
            <ol className="list-decimal list-inside space-y-1">
              <li>Apply left circular shifts to C and D blocks</li>
              <li>Concatenate blocks (C and D)</li>
              <li>Apply Permuted Choice 2 (PC-2)</li>
              <li>Generate 48-bit round key K<sub>i</sub></li>
            </ol>
          </div>
        </div>
      );
    }
    
    if (step.title.includes('Round')) {
      return (
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-lg border border-cyan-200">
          <h4 className="font-medium text-cyan-900 mb-4 text-center">DES Round Function</h4>
          <div className="flex items-center justify-center mb-6">
            <div className="flex flex-col items-center">
              <div className="text-xs text-cyan-700 mb-1">32-bit R<sub>i-1</sub></div>
              <div className="w-16 h-8 bg-cyan-100 rounded-md flex items-center justify-center mb-2">
                <span className="text-xs text-cyan-800">Input</span>
              </div>
              <ArrowDown className="text-cyan-500 w-4 h-4 my-1" />
              <div className="w-20 h-8 bg-cyan-200 rounded-md flex items-center justify-center mb-2">
                <span className="text-xs text-cyan-800">Expansion</span>
              </div>
              <ArrowDown className="text-cyan-500 w-4 h-4 my-1" />
              <div className="w-20 h-8 bg-teal-100 rounded-md flex items-center justify-center mb-2">
                <span className="text-xs text-teal-800">48-bit output</span>
              </div>
            </div>
            <div className="mx-4">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="font-bold text-teal-800">⊕</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-teal-700 mb-1">48-bit K<sub>i</sub></div>
              <div className="w-16 h-8 bg-teal-200 rounded-md flex items-center justify-center mb-2">
                <span className="text-xs text-teal-800">Round Key</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-cyan-800">
            <h5 className="font-medium mb-1">After XOR:</h5>
            <ol className="list-decimal list-inside space-y-1">
              <li>Divide into 8 blocks of 6 bits each</li>
              <li>Apply S-box substitution to each block</li>
              <li>Result: 32-bit output</li>
              <li>Apply P-box permutation</li>
              <li>XOR with L<sub>i-1</sub> to form R<sub>i</sub></li>
            </ol>
          </div>
        </div>
      );
    }
    
    return null;
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
  
  // Algorithm-specific gradient backgrounds
  const getBgGradient = () => {
    switch (algorithm) {
      case 'aes':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50';
      case 'des':
        return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50';
      case 'checksum':
        return 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50';
      default:
        return 'bg-gradient-to-br from-blue-50 to-indigo-50';
    }
  };

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
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge variant="outline" className="bg-white">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            {algorithm === 'aes' && <Badge className="bg-blue-600">AES-128</Badge>}
            {algorithm === 'des' && <Badge className="bg-emerald-600">DES-56</Badge>}
            {algorithm === 'checksum' && <Badge className="bg-amber-600">Checksum</Badge>}
          </div>
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
        <Progress value={progress} className="w-full h-2" 
          style={{
            background: algorithm === 'aes' ? 'linear-gradient(to right, #dbeafe, #e0e7ff)' : 
                       algorithm === 'des' ? 'linear-gradient(to right, #d1fae5, #ccfbf1)' :
                                           'linear-gradient(to right, #fef3c7, #ffedd5)'
          }}
        />
        <div className="text-sm text-gray-500 text-center">
          Progress: {Math.round(progress)}%
        </div>
      </div>

      <Card className={`shadow-md border-0 ${getBgGradient()}`}>
        <CardHeader>
          <CardTitle className={`text-xl ${
            algorithm === 'aes' ? 'text-blue-900' : 
            algorithm === 'des' ? 'text-emerald-900' : 
                                'text-amber-900'
          }`}>
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700 text-lg">{currentStepData.description}</p>
          
          <Tabs value={visualTab} onValueChange={setVisualTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detailed">Detailed View</TabsTrigger>
              <TabsTrigger value="conceptual">Conceptual View</TabsTrigger>
            </TabsList>
            <TabsContent value="detailed" className="mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-700">Input</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-sm bg-green-50 p-4 rounded border-2 border-green-200 overflow-auto">
                      {currentStepData.input}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-blue-700">Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-sm bg-blue-50 p-4 rounded border-2 border-blue-200 overflow-auto">
                      {currentStepData.output}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-white border shadow-sm mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-purple-700">Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{currentStepData.explanation}</p>
                  {renderVisualization(currentStepData)}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="conceptual" className="mt-4">
              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Conceptual Understanding</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderAltVisualization(currentStepData) || (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <p className="text-gray-600">No conceptual view available for this step.</p>
                      <p className="text-gray-500 text-sm mt-2">Please switch to detailed view to see the visualization.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                  ? algorithm === 'aes' ? 'bg-blue-600' : 
                    algorithm === 'des' ? 'bg-emerald-600' : 
                                        'bg-amber-600'
                  : index < currentStep 
                    ? algorithm === 'aes' ? 'bg-blue-400' : 
                      algorithm === 'des' ? 'bg-emerald-400' : 
                                          'bg-amber-400' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={() => setCurrentStep(currentStep + 1)}
            className={`flex items-center gap-2 ${
              algorithm === 'aes' ? 'bg-blue-600 hover:bg-blue-700' : 
              algorithm === 'des' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                  'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleComplete}
            className={`flex items-center gap-2 ${
              algorithm === 'aes' ? 'bg-blue-600 hover:bg-blue-700' : 
              algorithm === 'des' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                  'bg-amber-600 hover:bg-amber-700'
            }`}
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
