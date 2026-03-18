import React from 'react';

/**
 * LoadingSkeleton component for showing loading states
 * @param {Object} props - Component props
 */
const LoadingSkeleton = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full', 
  rounded = 'rounded' 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 ${height} ${width} ${rounded} ${className}`}
    />
  );
};

/**
 * MetricsCardSkeleton component for loading metrics cards
 */
export const MetricsCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <LoadingSkeleton width="w-12 h-12" rounded="rounded-full" />
      <LoadingSkeleton width="w-16 h-6" />
    </div>
    <LoadingSkeleton height="h-8" />
    <LoadingSkeleton height="h-4" width="w-24" className="mt-2" />
  </div>
);

/**
 * ChartSkeleton component for loading charts
 */
export const ChartSkeleton = ({ title = 'Loading Chart...' }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <LoadingSkeleton width="w-48 h-6" />
      <LoadingSkeleton width="w-24 h-4" />
    </div>
    <LoadingSkeleton height="h-64" />
  </div>
);

/**
 * ListSkeleton component for loading lists
 */
export const ListSkeleton = ({ 
  title = 'Loading List...', 
  itemCount = 5 
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <LoadingSkeleton width="w-48 h-6" className="mb-6" />
    <div className="space-y-4">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-3">
          <LoadingSkeleton width="w-10 h-10" rounded="rounded-full" />
          <LoadingSkeleton width="w-32 h-4" />
          <LoadingSkeleton width="w-16 h-4" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * InsightSkeleton component for loading insights
 */
export const InsightSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <LoadingSkeleton width="w-48 h-6" />
      <div className="flex items-center space-x-2">
        <LoadingSkeleton width="w-4 h-4" />
        <LoadingSkeleton width="w-24 h-4" />
      </div>
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
          <LoadingSkeleton width="w-8 h-8" rounded="rounded-full" />
          <LoadingSkeleton width="w-full h-4" />
          <LoadingSkeleton width="w-6 h-6" rounded="rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSkeleton;
