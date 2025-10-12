interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif-elegant font-semibold text-gray-900 text-center letter-spacing-wide">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 text-center mt-3 text-sm font-serif-body">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
