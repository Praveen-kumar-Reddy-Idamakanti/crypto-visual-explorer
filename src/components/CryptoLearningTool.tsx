
import React, { useState } from 'react';
import AlgorithmSelector from './AlgorithmSelector';
import InputPanel from './InputPanel';
import StepVisualizer from './StepVisualizer';
import ResultsDisplay from './ResultsDisplay';
import { Card } from "@/components/ui/card";

export type Algorithm = 'aes' | 'des' | 'checksum';
export type Action = 'encrypt' | 'decrypt' | 'both';

export interface CryptoState {
  algorithm: Algorithm | null;
  action: Action;
  input: string;
  currentStep: number;
  steps: any[];
  result: string;
  isProcessing: boolean;
}

const CryptoLearningTool = () => {
  const [state, setState] = useState<CryptoState>({
    algorithm: null,
    action: 'encrypt',
    input: '',
    currentStep: 0,
    steps: [],
    result: '',
    isProcessing: false
  });

  const [currentView, setCurrentView] = useState<'select' | 'input' | 'visualize' | 'results'>('select');

  const handleAlgorithmSelect = (algorithm: Algorithm) => {
    setState(prev => ({ ...prev, algorithm }));
    setCurrentView('input');
  };

  const handleStartProcess = (input: string, action: Action) => {
    setState(prev => ({ 
      ...prev, 
      input, 
      action, 
      isProcessing: true 
    }));
    setCurrentView('visualize');
  };

  const handleProcessComplete = (steps: any[], result: string) => {
    setState(prev => ({ 
      ...prev, 
      steps, 
      result, 
      isProcessing: false 
    }));
    setCurrentView('results');
  };

  const handleReset = () => {
    setState({
      algorithm: null,
      action: 'encrypt',
      input: '',
      currentStep: 0,
      steps: [],
      result: '',
      isProcessing: false
    });
    setCurrentView('select');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Cryptographic Algorithms Explorer
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn how encryption algorithms work through interactive step-by-step visualizations
        </p>
      </div>

      <Card className="max-w-6xl mx-auto p-6 bg-white shadow-lg">
        {currentView === 'select' && (
          <AlgorithmSelector onSelect={handleAlgorithmSelect} />
        )}
        
        {currentView === 'input' && state.algorithm && (
          <InputPanel 
            algorithm={state.algorithm}
            onStart={handleStartProcess}
            onBack={() => setCurrentView('select')}
          />
        )}
        
        {currentView === 'visualize' && state.algorithm && (
          <StepVisualizer
            algorithm={state.algorithm}
            input={state.input}
            action={state.action}
            onComplete={handleProcessComplete}
            onBack={() => setCurrentView('input')}
          />
        )}
        
        {currentView === 'results' && (
          <ResultsDisplay
            algorithm={state.algorithm!}
            input={state.input}
            result={state.result}
            steps={state.steps}
            onReset={handleReset}
            onViewSteps={() => setCurrentView('visualize')}
          />
        )}
      </Card>
    </div>
  );
};

export default CryptoLearningTool;
