
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
    // Removed getConfiguredProvidersMap as client-side detection is less reliable than server config
} from '@/ai/ai-config';

// Define available providers and their models (expand this as needed)
// Keep this structure for defining models per provider
// Note: This list doesn't guarantee the provider is *actually* configured on the server.
const providerModels = {
  googleai: [
      { value: 'googleai/gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Latest)' },
      { value: 'googleai/gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
      { value: 'googleai/gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental Image Gen)' },
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
  provider: z.string().optional(), // Display only
  model: z.string().optional(), // Display only
  apiKeyStatus: z.enum(['set', 'unset']).optional(), // Display only
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsForm() {
  const { toast } = useToast();
  // State to hold the configuration read from ai-config (which reads from process.env)
  const [displayProviderKey, setDisplayProviderKey] = useState<string | null>(null);
  const [displayModel, setDisplayModel] = useState<string>('');
  const [apiKeyIsSet, setApiKeyIsSet] = useState<boolean>(false); // Track if the *default* provider's key is set
  const [allProviderOptions, setAllProviderOptions] = useState<Array<{ key: string; label: string; isConfigured: boolean; apiKeyEnvVar: string }>>([]);

  // Fetch current configuration on mount (client-side reading server-set defaults)
  useEffect(() => {
    const defaultProviderKey = getDefaultProvider(); // Get the key ('googleai', etc.) from server config
    const defaultModel = getDefaultModelId(); // Get the model ID from server config
    const allProvidersConfig = getProvidersConfig(); // Get { googleai: { label: ..., apiKeyEnvVar: ...}}

    setDisplayProviderKey(defaultProviderKey);
    setDisplayModel(defaultModel);

    // Determine which providers are configured *based on server-side logic* reflected in defaults
    const providerOptions = Object.entries(allProvidersConfig).map(([key, config]) => {
         // We assume the default provider *is* configured if it was successfully set.
         // This is a slight simplification, but avoids client-side env checks.
         const isConfigured = key === defaultProviderKey;
         return {
             key: key,
             label: config.label,
             isConfigured: isConfigured,
             apiKeyEnvVar: config.apiKeyEnvVar,
         };
    });
    setAllProviderOptions(providerOptions);

    // Set API key status based *only* on the default provider being set
    setApiKeyIsSet(!!defaultProviderKey);

  }, []);

  // Form setup - primarily for display structure
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: { // Use 'values' to reflect current state, read-only
      provider: displayProviderKey ?? '',
      model: displayModel,
      apiKeyStatus: apiKeyIsSet ? 'set' : 'unset',
    },
    // mode: 'onChange', // Not needed
  });

  // Update form display values if state changes (e.g., initial load)
   useEffect(() => {
       form.setValue('provider', displayProviderKey ?? '');
       form.setValue('model', displayModel);
       form.setValue('apiKeyStatus', apiKeyIsSet ? 'set' : 'unset');
   }, [displayProviderKey, displayModel, apiKeyIsSet, form]);


  // This form doesn't actually save anything
  const onSubmit = (data: SettingsFormData) => {
    toast({
      title: 'Information',
      description: 'Settings are configured via environment variables in your .env file and require an application restart to take effect.',
    });
  };

   const currentProviderInfo = displayProviderKey ? allProviderOptions.find(p => p.key === displayProviderKey) : null;
   const currentApiKeyEnvVar = currentProviderInfo?.apiKeyEnvVar;
   const currentModels = displayProviderKey ? providerModels[displayProviderKey as ProviderKey] ?? [] : [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Configuration Method</AlertTitle>
        <AlertDescription>
          AI provider settings are managed using environment variables (e.g., in a <code>.env</code> file).
          Changes made require updating your environment variables and **restarting the application** server for them to take effect. This form displays the currently active configuration.
        </AlertDescription>
      </Alert>

      {/* Provider Display */}
      <div className="space-y-2">
        <Label htmlFor="provider">Configured AI Provider</Label>
         <Input
            id="provider"
            readOnly
            value={currentProviderInfo?.label ?? 'None Configured'}
            className="bg-muted/50"
         />
         <p className="text-xs text-muted-foreground">
            The active provider is determined by the API keys found in your server environment.
            The currently active default provider is: <strong>{displayProviderKey || 'None'}</strong>.
         </p>
         {/* Optionally list all potential providers and their status */}
         {/* <ul className="text-xs text-muted-foreground list-disc pl-5">
            {allProviderOptions.map(opt => (
                <li key={opt.key}>{opt.label}: {opt.isConfigured ? <span className='text-green-500'>Configured</span> : <span className='text-orange-500'>Not Configured</span>} (<code>{opt.apiKeyEnvVar}</code>)</li>
            ))}
         </ul> */}
      </div>


      {/* Model Display */}
      {displayProviderKey && currentModels.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="model">Configured Default Model</Label>
           <Input
               id="model"
               readOnly
               value={`${currentProviderInfo?.label ? providerModels[displayProviderKey as ProviderKey]?.find(m => m.value === displayModel)?.label : ''} (${displayModel})` ?? 'Not Set'}
               className="bg-muted/50"
           />
           <p className="text-xs text-muted-foreground">
                Default model is set via the <code>DEFAULT_GENAI_MODEL_ID</code> environment variable. Current value: <code>{getDefaultModelId()}</code>.
            </p>
        </div>
      )}


      {/* API Key Status Display */}
      {currentProviderInfo && (
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key Status ({currentApiKeyEnvVar})</Label>
          <div className="flex items-center gap-2">
            <Input
                id="apiKeyStatus"
                name="apiKeyStatus"
                readOnly
                value={apiKeyIsSet ? 'Detected & Active' : 'Not Detected / Inactive'}
                className={`bg-muted/50 ${apiKeyIsSet ? 'border-green-500' : 'border-destructive'}`}
            />
            <KeyRound className={`h-5 w-5 ${apiKeyIsSet ? 'text-green-500' : 'text-destructive'}`} />
            </div>
           <p className="text-xs text-muted-foreground">
                Indicates if the API key for the currently active provider (<code>{currentApiKeyEnvVar}</code>) was found in the server environment during startup.
            </p>
        </div>
      )}

       {/* Informational 'Save' Button */}
       <div className='flex justify-end'>
           <Button type="submit">
             Understood (Configure via .env)
           </Button>
       </div>
    </form>
  );
}
