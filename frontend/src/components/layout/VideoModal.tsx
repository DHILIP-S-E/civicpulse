import React from 'react';
import { X, Play, ShieldCheck, Film } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const VideoModal: React.FC = () => {
  const { isVideoModalOpen, setIsVideoModalOpen } = useAppStore();

  if (!isVideoModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsVideoModalOpen(false)}
    >
      <div
        className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1677FF] text-white flex items-center justify-center shadow-xs">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#172033]">
                  CivicPulse — Madurai Spatial Lakehouse Story Walkthrough
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3FF] text-[#1677FF] border border-[#1677FF]/20">
                  2m 11s Demo
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Official AWS Hackathon narrative demo featuring ultrasonic telemetry, safe corridor routing, and Apache Iceberg verification.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVideoModalOpen(false)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
            title="Close video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative bg-black aspect-video w-full flex items-center justify-center overflow-hidden">
          <video
            src="/civicpulse_madurai_story_demo.mp4"
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 font-medium text-[#172033]">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Full Narrative Walkthrough</span>
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span>Amazon Location Service · S3 · Apache Iceberg · Athena</span>
          </div>

          <button
            onClick={() => setIsVideoModalOpen(false)}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] hover:bg-[#F1F5F9] font-medium transition-colors cursor-pointer"
          >
            Close Walkthrough
          </button>
        </div>
      </div>
    </div>
  );
};
