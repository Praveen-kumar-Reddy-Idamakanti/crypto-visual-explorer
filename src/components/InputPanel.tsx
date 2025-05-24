
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Play } from 'lucide-react';
import { Algorithm, Action } from './CryptoLearningTool';

interface InputPanelProps {
  algorithm: Algorithm;
  onStart: (input: string, action: Action) => void;
  onBack: () => void;
}

const algorithmTitles = {
  aes: 'AES Encryption',
  des: 'DES Encryption', 
  checksum: 'Checksum Calculation'
};

const exampleInputs = {
  aes: 'Hello, this is a secret message!',
  des: 'Secret123',
  checksum: 'This is sample data for checksum calculation.'
};

const InputPanel: React.FC<InputPanelProps> = ({ algorithm, onStart, onBack }) => {
  const [input, setInput] = useState(exampleInputs[algorithm]);
  const [action, setAction] = useState<Action>('encrypt');

  const handleStart = () => {
    if (input.trim()) {
      onStart(input.trim(), action);
    }
  };

  const getActionDescription = () => {
    switch (algorithm) {
      case 'checksum':
        return 'Generate checksum for error detection';
      case 'aes':
      case 'des':
        return action === 'encrypt' ? 'Encrypt your message' : 'Decrypt your message';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {algorithmTitles[algorithm]}
          </h2>
          <p className="text-gray-600">{getActionDescription()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Input Data</CardTitle>
            <CardDescription>
              Enter the text you want to process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-text">Your Text</Label>
              <Textarea
                id="input-text"
                placeholder={`Enter text for ${algorithm.toUpperCase()} processing...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-32 mt-2"
              />
            </div>
            
            <div className="text-sm text-gray-500">
              Character count: {input.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Options</CardTitle>
            <CardDescription>
              Choose how to process your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {algorithm !== 'checksum' && (
              <div>
                <Label className="text-base font-medium">Action</Label>
                <RadioGroup value={action} onValueChange={(value) => setAction(value as Action)} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="encrypt" id="encrypt" />
                    <Label htmlFor="encrypt">Encrypt</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="decrypt" id="decrypt" />
                    <Label htmlFor="decrypt">Decrypt</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both (Encrypt then Decrypt)</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Algorithm Info</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {algorithm === 'aes' && (
                  <>
                    <div>• 128-bit key (simplified)</div>
                    <div>• 10 rounds of transformation</div>
                    <div>• SubBytes, ShiftRows, MixColumns</div>
                  </>
                )}
                {algorithm === 'des' && (
                  <>
                    <div>• 64-bit blocks, 56-bit key</div>
                    <div>• 16 rounds of Feistel cipher</div>
                    <div>• Initial and final permutation</div>
                  </>
                )}
                {algorithm === 'checksum' && (
                  <>
                    <div>• Simple sum-based calculation</div>
                    <div>• Detects data corruption</div>
                    <div>• One's complement arithmetic</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleStart}
          disabled={!input.trim()}
          size="lg"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Play className="w-5 h-5" />
          Start {algorithm.toUpperCase()} Process
        </Button>
      </div>
    </div>
  );
};

export default InputPanel;
