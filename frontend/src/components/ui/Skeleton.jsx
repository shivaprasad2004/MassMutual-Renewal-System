import React from 'react';

export const SkeletonLine = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`${width} ${height} bg-white/5 rounded shimmer ${className}`} />
);

export const SkeletonBlock = ({ width = 'w-full', height = 'h-24', className = '' }) => (
  <div className={`${width} ${height} bg-white/5 rounded-lg shimmer ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-card p-6 space-y-4 ${className}`}>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/5 shimmer" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="w-1/3" />
        <SkeletonLine width="w-1/2" height="h-3" />
      </div>
    </div>
    <SkeletonBlock height="h-16" />
    <div className="flex gap-2">
      <SkeletonLine width="w-20" height="h-6" />
      <SkeletonLine width="w-16" height="h-6" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="glass-card overflow-hidden">
    <div className="p-4 bg-white/5">
      <SkeletonLine width="w-48" height="h-3" />
    </div>
    <div className="divide-y divide-white/5">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-6">
          <SkeletonLine width="w-24" />
          <SkeletonLine width="w-32" />
          <SkeletonLine width="w-16" height="h-5" />
          <SkeletonLine width="w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <SkeletonLine width="w-32" height="h-3" />
        <SkeletonLine width="w-64" height="h-8" />
        <SkeletonLine width="w-48" height="h-3" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card p-6 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <SkeletonLine width="w-24" height="h-3" />
              <SkeletonLine width="w-16" height="h-8" />
            </div>
            <div className="w-10 h-10 bg-white/5 rounded shimmer" />
          </div>
          <SkeletonLine height="h-1" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SkeletonBlock height="h-[400px]" className="lg:col-span-2" />
      <SkeletonBlock height="h-[400px]" />
    </div>
  </div>
);
