import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { ArrowDown, afterMixColumnsMatrix } from './crypto/StepVisualizerHelper';
import type { Algorithm, Action } from './CryptoLearningTool';

interface StepVisualizerProps {
  algorithm: Algorithm;
  input: string;
  action: Action;
  onComplete: (steps: any[], result: string) => void;
  onBack: () => void;
}

interface Step {
  title: string;
  description: string | React.ReactNode;
  matrix?: number[][];
  result?: string;
}

const StepVisualizer: React.FC<StepVisualizerProps> = ({ algorithm, input, action, onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const processData = async () => {
      if (algorithm === 'aes') {
        const aesSteps = await runAES(input, action);
        setSteps(aesSteps.steps);
        setResult(aesSteps.result);
        onComplete(aesSteps.steps, aesSteps.result);
      } else if (algorithm === 'des') {
        const desSteps = await runDES(input, action);
        setSteps(desSteps.steps);
        setResult(desSteps.result);
        onComplete(desSteps.steps, desSteps.result);
      } else if (algorithm === 'checksum') {
        const checksumSteps = await runChecksum(input, action);
        setSteps(checksumSteps.steps);
        setResult(checksumSteps.result);
        onComplete(checksumSteps.steps, checksumSteps.result);
      }
    };

    processData();
  }, [algorithm, input, action, onComplete]);

  useEffect(() => {
    if (isPlaying) {
      const id = window.setInterval(() => {
        setCurrentStep((prevStep) => (prevStep < steps.length - 1 ? prevStep + 1 : prevStep));
      }, 1500);
      setIntervalId(id);
    } else if (intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isPlaying, steps.length]);

  const handleNext = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const togglePlay = () => {
    setIsPlaying((prevState) => !prevState);
  };

  const resetVisualization = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Mock implementations for the algorithms
  const runAES = async (input: string, action: Action) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockSteps = [
      { title: 'Initial Round', description: 'Starting the AES encryption process...' },
      { title: 'Add Round Key', description: 'Adding the round key to the state.' },
      { title: 'Sub Bytes', description: 'Performing byte substitution.' },
      { title: 'Shift Rows', description: 'Shifting the rows of the state.' },
      { title: 'Mix Columns', description: 'Mixing the columns of the state.' },
      { title: 'Final Round', description: 'Completing the final round of AES.' },
    ];
    return { steps: mockSteps, result: 'AES Encrypted Result' };
  };

  const runDES = async (input: string, action: Action) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockSteps = [
      { title: 'Initial Permutation', description: 'Rearranging the bits of the input.' },
      { title: 'Round 1', description: 'Performing the first round of DES.' },
      { title: 'Round 2', description: 'Performing the second round of DES.' },
      { title: 'Final Permutation', description: 'Rearranging the bits to produce the output.' },
    ];
    return { steps: mockSteps, result: 'DES Encrypted Result' };
  };

  const runChecksum = async (input: string, action: Action) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockSteps = [
      { title: 'Initial State', description: 'Starting checksum calculation...' },
      { title: 'Processing Data', description: 'Calculating checksum...' },
      { title: 'Final Checksum', description: 'Final checksum value.' },
    ];
    return { steps: mockSteps, result: 'Checksum Result' };
  };

  if (steps.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Step-by-Step Visualization</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
          <p>{steps[currentStep].description}</p>
          {steps[currentStep].matrix && (
            <div className="mt-4">
              <p>Matrix:</p>
              <pre>{JSON.stringify(steps[currentStep].matrix, null, 2)}</pre>
            </div>
          )}
          {steps[currentStep].result && (
            <div className="mt-4">
              <p>Result: {steps[currentStep].result}</p>
            </div>
          )}
        </div>

        <Progress value={(currentStep / (steps.length - 1)) * 100} className="mb-4" />

        <div className="flex justify-between items-center">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <Button variant="outline" size="icon" onClick={resetVisualization} disabled={currentStep === 0}>
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
            <Button variant="outline" size="icon" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} disabled={currentStep === steps.length - 1}>
              <ChevronRight className="h-4 w-4" />
              <span>Next</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepVisualizer;
