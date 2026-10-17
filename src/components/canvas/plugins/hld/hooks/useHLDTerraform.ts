import { useState } from 'react';
import { HLDASTEngine } from '../ast/HLDASTEngine';

export function useHLDTerraform(excalidrawAPI: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [terraformCode, setTerraformCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateTerraform = async () => {
    if (!excalidrawAPI) return;

    setIsGenerating(true);
    setError(null);
    setTerraformCode(null);

    try {
      const elements = excalidrawAPI.getSceneElements();
      const activeElements = elements.filter((el: any) => !el.isDeleted);
      
      if (activeElements.length === 0) {
        throw new Error("Please draw your architecture first.");
      }

      const hldAST = HLDASTEngine.parseFromCanvas(activeElements);

      if (hldAST.nodes.length === 0) {
        throw new Error("No valid components found in diagram.");
      }

      const response = await fetch('/api/ai/hld-terraform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ast: hldAST })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to generate Terraform code");
      }

      setTerraformCode(result.data);

    } catch (err: any) {
      console.error("Terraform Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, terraformCode, error, generateTerraform };
}
