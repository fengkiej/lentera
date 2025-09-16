import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message }) => {
  const { t } = useTranslation('common');
  const defaultMessage = message || t('loading.default');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-warm-beige to-white">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-deep-green-700 mx-auto mb-4" />
        <p className="text-brand-deep-green-700 font-medium">{defaultMessage}</p>
      </div>
    </div>
  );
};

export default Loading;