import Navigation from '@/components/Navigation';
import Header from '@/components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header title={title} subtitle={subtitle} />
      
      <main className="flex-1 pb-20 px-4 max-w-md mx-auto w-full">
        {children}
      </main>
      
      <Navigation />
    </div>
  );
}
