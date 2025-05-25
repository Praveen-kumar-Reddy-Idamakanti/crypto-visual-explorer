
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Calculator, Key, Network, Zap } from 'lucide-react';
import { Algorithm } from './CryptoLearningTool';

interface AlgorithmSelectorProps {
  onSelect: (algorithm: Algorithm) => void;
}

const algorithmData = {
  aes: {
    title: 'AES (Advanced Encryption Standard)',
    description: 'Modern symmetric encryption with 128, 192, or 256-bit keys',
    icon: Shield,
    color: 'bg-blue-500',
    steps: 'AddRoundKey → SubBytes → ShiftRows → MixColumns',
    complexity: 'Advanced',
    available: true
  },
  des: {
    title: 'DES (Data Encryption Standard)',
    description: 'Classic symmetric encryption with 56-bit key and 16 rounds',
    icon: Lock,
    color: 'bg-green-500',
    steps: 'Initial Permutation → 16 Rounds → Final Permutation',
    complexity: 'Intermediate',
    available: true
  },
  checksum: {
    title: 'Checksum Algorithm',
    description: 'Simple error detection method using mathematical summation',
    icon: Calculator,
    color: 'bg-purple-500',
    steps: 'Block Division → Sum Calculation → Checksum Generation',
    complexity: 'Beginner',
    available: true
  },
  rsa: {
    title: 'RSA (Rivest-Shamir-Adleman)',
    description: 'Public-key cryptosystem for secure data transmission',
    icon: Key,
    color: 'bg-red-500',
    steps: 'Key Generation → Encryption → Decryption',
    complexity: 'Advanced',
    available: false
  },
  diffie_hellman: {
    title: 'Diffie-Hellman Key Exchange',
    description: 'Method for securely exchanging cryptographic keys',
    icon: Network,
    color: 'bg-orange-500',
    steps: 'Parameter Setup → Key Exchange → Shared Secret',
    complexity: 'Advanced',
    available: false
  },
  ecc: {
    title: 'Elliptic Curve Cryptography',
    description: 'Public key cryptography based on elliptic curve mathematics',
    icon: Zap,
    color: 'bg-indigo-500',
    steps: 'Curve Selection → Point Operations → Key Generation',
    complexity: 'Expert',
    available: false
  }
};

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({ onSelect }) => {
  const availableAlgorithms = Object.entries(algorithmData).filter(([_, data]) => data.available);
  const comingSoonAlgorithms = Object.entries(algorithmData).filter(([_, data]) => !data.available);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Choose an Algorithm to Explore
        </h2>
        <p className="text-gray-600">
          Select a cryptographic algorithm to see how it works step by step
        </p>
      </div>

      {/* Available Algorithms */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Available Algorithms</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {(availableAlgorithms as [Algorithm, typeof algorithmData.aes][]).map(([key, algorithm]) => {
            const IconComponent = algorithm.icon;
            
            return (
              <Card 
                key={key} 
                className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-blue-300"
                onClick={() => onSelect(key)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${algorithm.color} flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{algorithm.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {algorithm.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">Key Steps:</div>
                    <div className="text-gray-600 text-xs">{algorithm.steps}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      algorithm.complexity === 'Beginner' ? 'bg-green-100 text-green-800' :
                      algorithm.complexity === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      algorithm.complexity === 'Expert' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {algorithm.complexity}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:bg-blue-50"
                    >
                      Explore →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Algorithms */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Coming Soon</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {comingSoonAlgorithms.map(([key, algorithm]) => {
            const IconComponent = algorithm.icon;
            
            return (
              <Card 
                key={key} 
                className="opacity-60 border-2 border-dashed border-gray-300 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  Coming Soon
                </div>
                
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${algorithm.color} opacity-50 flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg text-gray-600">{algorithm.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {algorithm.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-600 mb-1">Key Steps:</div>
                    <div className="text-gray-500 text-xs">{algorithm.steps}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600`}>
                      {algorithm.complexity}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled
                      className="cursor-not-allowed"
                    >
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Learning Tip</h3>
        <p className="text-blue-800 text-sm">
          Start with Checksum if you're new to cryptography, then progress to DES and AES. 
          Each algorithm builds on fundamental concepts that will help you understand the next level.
          More advanced algorithms like RSA, Diffie-Hellman, and ECC will be available soon!
        </p>
      </div>
    </div>
  );
};

export default AlgorithmSelector;
