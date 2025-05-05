
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, KeyRound } from 'lucide-react';
// Import helpers from the config file
import {
    getDefaultModelId,
    getDefaultProvider,
    getProvidersConfig, // Get the full config including API key var names
    getConfiguredProvidersMap // Get the key->label map of *actually* configured ones (Client-side check)
} from '@/ai/ai-config';

// Define available providers and their models (expand this as needed)
// Keep this structure for defining models per provider
const providerModels = {
  googleai: [
      { value: 'googleai/gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Latest)' },
      { value: 'googleai/gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
      { value: 'googleai/gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
      // Add other relevant Gemini models
  ],
  // Add other providers like OpenAI, Anthropic when implemented
  // openai: [
  //     { value: 'openai/gpt-4', label: 'GPT-4' },
  //     { value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  // ],
  // anthropic: [
  //     { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
  //     { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
  //     { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
  // ]
};

type ProviderKey = keyof typeof providerModels;

// Form Schema (Focus on reading/displaying, not saving state directly)
const settingsSchema = z.object({
  provider: z.string(), // Just stores the key (e.g., 'googleai')
  model: z.string(),
  apiKey: z.string().optional(), // API key is read-only from env
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsForm() {
  const { toast } = useToast();
  const [currentProviderKey, setCurrentProviderKey] = useState<ProviderKey | null>(null);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<Record<string, 'set' | 'unset'>>({}); // Use string key
  const [configuredProviderKeysList, setConfiguredProviderKeysList] = useState<string[]>([]);
  const [allProviderOptions, setAllProviderOptions] = useState<Array<{ key: string; label: string }>>([]); // Use string key

  // Fetch current configuration on mount (client-side)
  useEffect(() => {
    const defaultProviderKey = getDefaultProvider(); // Get the key ('googleai', etc.)
    const defaultModel = getDefaultModelId();
    const configuredMap = getConfiguredProvidersMap(); // Get client-side { 'googleai': 'Google AI...' }
    const allProvidersConfig = getProvidersConfig(); // Get { googleai: { label: ..., apiKeyEnvVar: ...}}

    const configuredKeys = Object.keys(configuredMap);
    setConfiguredProviderKeysList(configuredKeys);

    const providerOptions = Object.entries(allProvidersConfig).map(([key, config]) => ({
        key: key, // Key is string
        label: config.label,
    }));
    setAllProviderOptions(providerOptions);


    if (defaultProviderKey && allProvidersConfig[defaultProviderKey]) {
      setCurrentProviderKey(defaultProviderKey as ProviderKey);
    } else if (configuredKeys.length > 0) {
        setCurrentProviderKey(configuredKeys[0] as ProviderKey); // Fallback to first configured
    } else {
        // If no default and none configured, maybe pick the first available option?
         const firstAvailableKey = providerOptions.length > 0 ? providerOptions[0].key : null;
         setCurrentProviderKey(firstAvailableKey as ProviderKey | null);
    }

    setCurrentModel(defaultModel);

    // Check API key status based on the client-side check
    const keyStatuses: Record<string, 'set' | 'unset'> = {};
    providerOptions.forEach(opt => {
        keyStatuses[opt.key] = configuredMap[opt.key] ? 'set' : 'unset';
    });
    setApiKeyStatus(keyStatuses);

  }, []);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: { // Use 'values' to reflect current state, not for submission
      provider: currentProviderKey ?? '',
      model: currentModel,
      // Display based on the *client-side* detection of the key
      apiKey: apiKeyStatus[currentProviderKey ?? ''] === 'set' ? '********' : '', // Mask if detected
    },
    // mode: 'onChange', // Not needed as we're not really submitting
  });

   // Update form values when state changes
   useEffect(() => {
       form.setValue('provider', currentProviderKey ?? '');
       form.setValue('model', currentModel);
       form.setValue('apiKey', apiKeyStatus[currentProviderKey ?? ''] === 'set' ? '********' : '');
   }, [currentProviderKey, currentModel, apiKeyStatus, form]);


  const handleProviderChange = (value: string) => {
      const newProviderKey = value as ProviderKey;
      // Use getProvidersConfig() to check if it's a valid potential provider
      if (getProvidersConfig()[newProviderKey]) {
          setCurrentProviderKey(newProviderKey);
          // Select the first model of the new provider as default display
          const firstModel = providerModels[newProviderKey]?.[0]?.value;
          setCurrentModel(firstModel ?? ''); // Update displayed model
      }
  };


  // This form doesn't actually save anything, it just displays current config read on mount
  const onSubmit = (data: SettingsFormData) => {
    toast({
      title: 'Information',
      description: 'Settings are configured via environment variables and require an application restart.',
    });
  };

   const currentProviderFullConfig = currentProviderKey ? getProvidersConfig()[currentProviderKey] : null;
   const currentApiKeyEnvVar = currentProviderFullConfig?.apiKeyEnvVar;
   // Use the client-side detected status for display
   const isCurrentApiKeySet = currentProviderKey ? apiKeyStatus[currentProviderKey] === 'set' : false;
   const currentModels = currentProviderKey ? providerModels[currentProviderKey] : [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Configuration Method</AlertTitle>
        <AlertDescription>
          AI provider settings are managed using environment variables (e.g., in a <code>.env</code> file).
          Changes here are for display only. You must update your environment variables and restart the application for changes to take effect.
        </AlertDescription>
      </Alert>

      {/* Provider Selection */}
      <div className="space-y-2">
        <Label htmlFor="provider">AI Provider</Label>
        <Select
            name="provider"
            value={currentProviderKey ?? ''}
            onValueChange={handleProviderChange}
        >
          <SelectTrigger id="provider">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {allProviderOptions.map(({key, label}) => (
              <SelectItem key={key} value={key}>
                 {label}
                 {/* Indicate if the key was detected client-side */}
                 {!configuredProviderKeysList.includes(key) && ' (API Key Not Detected)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
         {configuredProviderKeysList.length === 0 && (
             <p className="text-sm text-destructive">No AI provider API keys detected in client environment.</p>
          )}
      </div>


      {/* Model Selection */}
      {currentProviderKey && currentModels.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="model">Default Model</Label>
           <Select
               name="model"
               value={currentModel}
                // Only allow changing display, doesn't affect actual default
               onValueChange={(value) => setCurrentModel(value)}
               disabled={!currentProviderKey}
           >
            <SelectTrigger id="model">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
                {currentModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                    {model.label} {model.value === getDefaultModelId() && '(Current Default)'}
                    </SelectItem>
                ))}
            </SelectContent>
          </Select>
           <p className="text-xs text-muted-foreground">
                Default model is set via <code>DEFAULT_GENAI_MODEL_ID</code> environment variable (currently: <code>{getDefaultModelId()}</code>). This may differ from the model selected above, which is for display reference only.
            </p>
        </div>
      )}


      {/* API Key Display */}
      {currentProviderFullConfig && (
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key ({currentApiKeyEnvVar})</Label>
          <div className="flex items-center gap-2">
            <Input
                id="apiKey"
                name="apiKey"
                type="password"
                readOnly
                value={isCurrentApiKeySet ? '••••••••••••••••' : ''}
                placeholder={isCurrentApiKeySet ? 'API Key Detected' : 'API Key Not Detected'}
                className="bg-muted/50"
            />
            <KeyRound className={`h-5 w-5 ${isCurrentApiKeySet ? 'text-green-500' : 'text-destructive'}`} />
            </div>
           <p className="text-xs text-muted-foreground">
                API Key status shown here is based on client-side detection of the <code>{currentApiKeyEnvVar}</code> environment variable. The actual server configuration might differ.
            </p>
        </div>
      )}

       {/* Informational 'Save' Button */}
       <div className='flex justify-end'>
           <Button type="submit" disabled>
             View Only (Configure via .env)
           </Button>
       </div>
    </form>
  );
}
```