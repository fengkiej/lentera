import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLanguagePreference } from "@/utils/localStorage";

export function LanguagePersistenceTest() {
  const { t, i18n } = useTranslation();
  const [storedLanguage, setStoredLanguage] = useState<string | null>(null);

  // Update the stored language whenever it changes
  useEffect(() => {
    setStoredLanguage(getLanguagePreference());
  }, [i18n.language]); // Re-run when language changes

  return (
    <Card className="max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>{t('common.language', 'Language Persistence Test')}</CardTitle>
        <CardDescription>
          {t('common.languageDescription', 'This component tests whether language settings are properly saved and translations work')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="font-medium">{t('common.currentLanguage', 'Current active language:')}</div>
          <div>{i18n.language}</div>
          
          <div className="font-medium">{t('common.storedLanguage', 'Stored in localStorage:')}</div>
          <div>{storedLanguage || t('common.none', 'None')}</div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-semibold mb-2">{t('common.translationSamples', 'Translation Samples:')}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">NotFound Page:</div>
            <div>{t('notFound.title')}</div>
            
            <div className="font-medium">Explore Page:</div>
            <div>{t('explorePage.search.results')}</div>
            
            <div className="font-medium">Five Whys:</div>
            <div>{t('fiveWhys.title')}</div>
            
            <div className="font-medium">API Error:</div>
            <div>{t('api.errors.generic')}</div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
          <p>{t('common.instructions', 'Instructions to test:')}</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>{t('common.step1', 'Select a language using the language switcher')}</li>
            <li>{t('common.step2', 'Observe how the translations above change')}</li>
            <li>{t('common.step3', 'Refresh the page to verify persistence')}</li>
          </ol>
        </div>
        
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          {t('common.refresh', 'Refresh Page')}
        </Button>
      </CardContent>
    </Card>
  );
}