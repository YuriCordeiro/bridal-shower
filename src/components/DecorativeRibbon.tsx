interface DecorativeRibbonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function DecorativeRibbon({ size = 'md', className = '' }: DecorativeRibbonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full text-gray-800"
        fill="currentColor"
      >
        {/* Laço decorativo inspirado no convite */}
        <path d="M50 10 C30 10, 15 25, 15 45 C15 60, 25 70, 40 75 L40 85 C40 90, 45 95, 50 95 C55 95, 60 90, 60 85 L60 75 C75 70, 85 60, 85 45 C85 25, 70 10, 50 10 Z" />
        <path d="M35 45 C35 35, 42 30, 50 30 C58 30, 65 35, 65 45 C65 55, 58 60, 50 60 C42 60, 35 55, 35 45 Z" fill="white" />
        <circle cx="50" cy="45" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}
