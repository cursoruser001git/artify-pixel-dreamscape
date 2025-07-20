import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Download, Sparkles, Wand2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GenerationParams {
  prompt: string;
  model: string;
  width: number;
  height: number;
  enhance: boolean;
  transparent: boolean;
  apiKey: string;
}

const ImageGenerator = () => {
  const [params, setParams] = useState<GenerationParams>({
    prompt: '',
    model: 'flux',
    width: 1024,
    height: 1024,
    enhance: false,
    transparent: false,
    apiKey: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildApiUrl = (params: GenerationParams): string => {
    const baseUrl = 'https://image.pollinations.ai/prompt';
    const encodedPrompt = encodeURIComponent(params.prompt);
    
    const searchParams = new URLSearchParams({
      model: params.model,
      width: params.width.toString(),
      height: params.height.toString(),
      nologo: 'true',
      safe: 'true',
      private: 'true',
      seed: Math.floor(Math.random() * 1000000).toString(),
      nofeed: 'true',
    });

    if (params.apiKey) {
      searchParams.append('key', params.apiKey);
    }

    if (params.enhance) {
      searchParams.append('enhance', 'true');
    }

    if (params.transparent && params.model === 'gptimage') {
      searchParams.append('transparent', 'true');
    }

    return `${baseUrl}/${encodedPrompt}?${searchParams.toString()}`;
  };

  const generateImage = async () => {
    if (!params.prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const apiUrl = buildApiUrl(params);
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      // Create a blob URL for the image
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      setGeneratedImage(imageUrl);
      toast({
        title: "Success!",
        description: "Your image has been generated successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Image Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Create stunning images with advanced AI models
          </p>
        </div>

        {/* Generation Form */}
        <Card className="bg-gradient-card border-border shadow-card p-6">
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm font-medium">
                Describe your image *
              </Label>
              <Textarea
                id="prompt"
                placeholder="A serene mountain landscape at sunset with vibrant orange and purple skies..."
                value={params.prompt}
                onChange={(e) => setParams(prev => ({ ...prev, prompt: e.target.value }))}
                className="min-h-[100px] bg-background/50 border-border resize-none focus:ring-2 focus:ring-primary transition-all"
                required
              />
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                Pollinations API Key (Optional)
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Pollinations API key"
                value={params.apiKey}
                onChange={(e) => setParams(prev => ({ ...prev, apiKey: e.target.value }))}
                className="bg-background/50 border-border"
              />
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium">
                AI Model
              </Label>
              <Select 
                value={params.model} 
                onValueChange={(value) => setParams(prev => ({ ...prev, model: value }))}
              >
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="flux">Flux - High Quality</SelectItem>
                  <SelectItem value="turbo">Turbo - Fast Generation</SelectItem>
                  <SelectItem value="gptimage">GPT Image - Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width" className="text-sm font-medium">
                  Width
                </Label>
                <Input
                  id="width"
                  type="number"
                  min="256"
                  max="2048"
                  step="64"
                  value={params.width}
                  onChange={(e) => setParams(prev => ({ ...prev, width: parseInt(e.target.value) || 1024 }))}
                  className="bg-background/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm font-medium">
                  Height
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="256"
                  max="2048"
                  step="64"
                  value={params.height}
                  onChange={(e) => setParams(prev => ({ ...prev, height: parseInt(e.target.value) || 1024 }))}
                  className="bg-background/50 border-border"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enhance"
                  checked={params.enhance}
                  onCheckedChange={(checked) => setParams(prev => ({ ...prev, enhance: !!checked }))}
                />
                <Label htmlFor="enhance" className="text-sm font-medium cursor-pointer">
                  Enhance quality
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transparent"
                  checked={params.transparent}
                  disabled={params.model !== 'gptimage'}
                  onCheckedChange={(checked) => setParams(prev => ({ ...prev, transparent: !!checked }))}
                />
                <Label 
                  htmlFor="transparent" 
                  className={`text-sm font-medium cursor-pointer ${
                    params.model !== 'gptimage' ? 'opacity-50' : ''
                  }`}
                >
                  Transparent background (GPT Image only)
                </Label>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateImage}
              disabled={isLoading || !params.prompt.trim()}
              variant="generate"
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-destructive/10 border-destructive/20 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </Card>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <Card className="bg-gradient-card border-border shadow-card p-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Image</h3>
                <Button onClick={downloadImage} variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="rounded-lg overflow-hidden bg-muted">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <Card className="bg-gradient-card border-border shadow-card p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generating Image...</h3>
                <div className="animate-pulse bg-muted h-9 w-24 rounded"></div>
              </div>
              <div className="aspect-square bg-muted rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;