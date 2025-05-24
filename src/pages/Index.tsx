
import React from 'react';
import CryptoLearningTool from '../components/CryptoLearningTool';
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <CryptoLearningTool />
      <Toaster />
    </div>
  );
};

export default Index;
