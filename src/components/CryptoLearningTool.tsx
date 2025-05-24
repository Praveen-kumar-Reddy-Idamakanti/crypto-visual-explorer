import React, { useState } from 'react';
import AlgorithmSelector from './AlgorithmSelector';
import InputPanel from './InputPanel';
import StepVisualizer from './StepVisualizer';
import ResultsDisplay from './ResultsDisplay';
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
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

  const handleError = (error: Error) => {
    console.error("Crypto processing error:", error);
    toast({
      title: "Error Processing",
      description: `There was an error: ${error.message}. Please try a different input or algorithm.`,
      variant: "destructive"
    });
    setState(prev => ({ ...prev, isProcessing: false }));
    // Return to the input selection on error
    setCurrentView('input');
  };

  const getBgGradient = () => {
    if (state.algorithm === 'aes') {
      return 'from-blue-50 to-indigo-100';
    } else if (state.algorithm === 'des') {
      return 'from-emerald-50 to-teal-100';
    } else if (state.algorithm === 'checksum') {
      return 'from-amber-50 to-yellow-100';
    } else {
      return 'from-slate-50 to-blue-100';
    }
  }

  return (
    <div className={`container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br ${getBgGradient()}`}>
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-bold mb-4 ${
          state.algorithm === 'aes' ? 'text-blue-800' : 
          state.algorithm === 'des' ? 'text-emerald-800' : 
          state.algorithm === 'checksum' ? 'text-amber-800' :
          'text-gray-800'
        }`}>
          Cryptographic Algorithms Explorer
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn how encryption algorithms work through interactive step-by-step visualizations
        </p>
      </div>

      <Card className={`max-w-6xl mx-auto p-6 bg-white shadow-xl rounded-xl ${
        currentView === 'visualize' ? 'border-t-4' : ''
      } ${
        state.algorithm === 'aes' ? 'border-blue-500' :
        state.algorithm === 'des' ? 'border-emerald-500' :
        state.algorithm === 'checksum' ? 'border-amber-500' :
        ''
      }`}>
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
            onError={handleError}
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
      
      {/* Footer */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>© 2025 Cryptographic Algorithms Explorer - Educational Tool</p>
      </div>
    </div>
  );
};

export default CryptoLearningTool;
