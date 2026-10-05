import { Loader2 } from 'lucide-react';

const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />

        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};

export default PageLoader;
