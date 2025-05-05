
import React from 'react';
import SettingsForm from '@/components/settings/settings-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
        <Card className="w-full">
            <CardHeader>
                <CardTitle>AI Configuration Settings</CardTitle>
                <CardDescription>
                    Configure the AI provider, model, and API keys used by the application.
                    Changes require setting environment variables and restarting the application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <SettingsForm />
            </CardContent>
        </Card>
    </div>
  );
}
