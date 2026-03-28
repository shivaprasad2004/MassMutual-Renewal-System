import React from 'react';

const GradientMesh = () => {
  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 gradient-mesh-bg" />
      <style>{`
        .gradient-mesh-bg {
          background:
            radial-gradient(ellipse at 20% 50%, rgba(30, 58, 138, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(30, 64, 175, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 90%, rgba(30, 58, 138, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 10% 10%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
          animation: gradient-drift 15s ease-in-out infinite alternate;
        }

        @keyframes gradient-drift {
          0% {
            background-position: 0% 0%, 100% 0%, 50% 100%, 90% 90%, 10% 10%;
          }
          33% {
            background-position: 10% 20%, 80% 30%, 40% 80%, 85% 85%, 15% 15%;
          }
          66% {
            background-position: 20% 10%, 70% 40%, 60% 70%, 80% 80%, 20% 20%;
          }
          100% {
            background-position: 5% 15%, 90% 10%, 45% 90%, 95% 95%, 5% 5%;
          }
        }
      `}</style>
    </div>
  );
};

export default GradientMesh;
