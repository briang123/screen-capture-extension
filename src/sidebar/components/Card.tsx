import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, interactive = false, className = '' }) => {
  const baseClasses =
    'bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6';
  const interactiveClasses = interactive ? 'hover:shadow-md transition-shadow cursor-pointer' : '';

  return (
    <div className={[baseClasses, interactiveClasses, className].join(' ')}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;
