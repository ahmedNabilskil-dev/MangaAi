
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
import { getDefaultModelId, getConfiguredProviders, getDefaultProvider } from '@/ai/ai-instance'; // Import helpers

// Define available providers and their models (expand this as needed)
const providersConfig = {
  googleai: {
    label: 'Google AI (Gemini)',
    models: [
      { value: 'googleai/gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Latest)' },
      { value: 'googleai/gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
      { value: 'googleai/gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
      // Add other relevant Gemini models
    ],
    apiKeyEnvVar: 'GOOGLE_GENAI_API_KEY',
  },
  // Add other providers like OpenAI, Anthropic when implemented
  // openai: {
  //   label: 'OpenAI (ChatGPT)',
  //   models: [
  //     { value: 'openai/gpt-4', label: 'GPT-4' },
  //     { value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  //   ],
  //   apiKeyEnvVar: 'OPENAI_API_KEY',
  // },
  // anthropic: {
  //   label: 'Anthropic (Claude)',
  //   models: [
  //       { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
  //       { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
  //       { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
  //   ],
  //   apiKeyEnvVar: 'ANTHROPIC_API_KEY',
  // }
};

type ProviderKey = keyof typeof providersConfig;

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
  const [apiKeyStatus, setApiKeyStatus] = useState<Record<ProviderKey, 'set' | 'unset'>>({
    googleai: 'unset',
    // openai: 'unset',
    // anthropic: 'unset',
  });
  const [configuredProvidersList, setConfiguredProvidersList] = useState<string[]>([]);

  // Fetch current configuration on mount (client-side)
  useEffect(() => {
    const defaultProviderKey = getDefaultProvider(); // Get the first configured or default
    const defaultModel = getDefaultModelId();
    const providers = getConfiguredProviders(); // Get list of names like "Google AI"

    // Map display names back to keys if possible (simplistic)
    const configuredProviderKeys = Object.entries(providersConfig)
        .filter(([key, config]) => providers.includes(config.label))
        .map(([key]) => key as ProviderKey);

    setConfiguredProvidersList(providers);

    if (defaultProviderKey && providersConfig[defaultProviderKey as ProviderKey]) {
      setCurrentProviderKey(defaultProviderKey as ProviderKey);
    } else if (configuredProviderKeys.length > 0) {
        setCurrentProviderKey(configuredProviderKeys[0]); // Fallback to first configured
    }

    setCurrentModel(defaultModel);

    // Check API key status (client-side access to process.env is limited, this is illustrative)
    // In a real scenario, this status check would likely need to happen server-side
    // or be inferred differently if keys aren't exposed to the client.
    // This simulation assumes we can know *if* a key was provided during server start.
    const keyStatuses: Record<ProviderKey, 'set' | 'unset'> = { googleai: 'unset' };
    if (configuredProviderKeys.includes('googleai')) keyStatuses.googleai = 'set';
    // Add checks for other providers if implemented
    setApiKeyStatus(keyStatuses);

  }, []);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: { // Use 'values' to reflect current state, not for submission
      provider: currentProviderKey ?? '',
      model: currentModel,
      apiKey: apiKeyStatus[currentProviderKey ?? 'googleai'] === 'set' ? '********' : '', // Mask if set
    },
    // mode: 'onChange', // Not needed as we're not really submitting
  });

  const handleProviderChange = (value: string) => {
      const newProviderKey = value as ProviderKey;
      if (providersConfig[newProviderKey]) {
          setCurrentProviderKey(newProviderKey);
          // Select the first model of the new provider as default display
          const firstModel = providersConfig[newProviderKey].models[0]?.value;
          setCurrentModel(firstModel ?? ''); // Update displayed model
          // Update the masked API key display based on the new provider
          form.setValue('apiKey', apiKeyStatus[newProviderKey] === 'set' ? '********' : '');
          form.setValue('provider', newProviderKey);
          form.setValue('model', firstModel ?? '');
      }
  };


  // This form doesn't actually save anything, it just displays current config read on mount
  const onSubmit = (data: SettingsFormData) => {
    toast({
      title: 'Information',
      description: 'Settings are configured via environment variables and require an application restart.',
    });
  };

   const currentProviderConfig = currentProviderKey ? providersConfig[currentProviderKey] : null;
   const currentApiKeyEnvVar = currentProviderConfig?.apiKeyEnvVar;
   const isCurrentApiKeySet = currentProviderKey ? apiKeyStatus[currentProviderKey] === 'set' : false;

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
            {Object.entries(providersConfig).map(([key, config]) => (
              <SelectItem key={key} value={key} disabled={!configuredProvidersList.includes(config.label)}>
                {config.label} {!configuredProvidersList.includes(config.label) && '(Not Configured)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
         {!currentProviderKey && configuredProvidersList.length === 0 && (
             <p className="text-sm text-destructive">No AI providers configured via API keys.</p>
          )}
          {currentProviderKey && !configuredProvidersList.includes(currentProviderConfig?.label ?? '') && (
              <p className="text-sm text-destructive">
                  Selected provider ({currentProviderConfig?.label}) is not currently configured with an API key.
              </p>
          )}
      </div>


      {/* Model Selection */}
      {currentProviderConfig && (
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
                {currentProviderConfig.models.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                    {model.label} {model.value === getDefaultModelId() && '(Current Default)'}
                    </SelectItem>
                ))}
            </SelectContent>
          </Select>
           <p className="text-xs text-muted-foreground">
                Default model is set via <code>DEFAULT_GENAI_MODEL_ID</code> environment variable (currently: <code>{getDefaultModelId()}</code>).
            </p>
        </div>
      )}


      {/* API Key Display */}
      {currentProviderConfig && (
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key ({currentApiKeyEnvVar})</Label>
          <div className="flex items-center gap-2">
            <Input
                id="apiKey"
                name="apiKey"
                type="password"
                readOnly
                value={isCurrentApiKeySet ? '••••••••••••••••' : ''}
                placeholder={isCurrentApiKeySet ? 'API Key is Set' : 'API Key Not Set'}
                className="bg-muted/50"
            />
            <KeyRound className={`h-5 w-5 ${isCurrentApiKeySet ? 'text-green-500' : 'text-destructive'}`} />
            </div>
           <p className="text-xs text-muted-foreground">
                API Key status for {currentProviderConfig.label} is based on the presence of the <code>{currentApiKeyEnvVar}</code> environment variable at startup.
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
