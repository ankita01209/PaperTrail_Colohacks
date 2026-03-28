"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Save, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import toast from 'react-hot-toast';

// Mock OCR Data matching API spec
interface OCRField {
  key: string;
  value: string;
  confidence: number;
  bounding_box: {
    x_min: number; // 0.0 - 1.0
    y_min: number; // 0.0 - 1.0
    x_max: number; // 0.0 - 1.0
    y_max: number; // 0.0 - 1.0
  };
}

const mockTemplateFields = [
  { key: 'first_name', label: 'First Name', type: 'text' },
  { key: 'last_name', label: 'Last Name', type: 'text' },
  { key: 'dob', label: 'Date of Birth', type: 'date' },
  { key: 'id_number', label: 'ID Number', type: 'text' },
];

const mockExtractedData: OCRField[] = [
  { key: 'first_name', value: 'Ramesh', confidence: 0.98, bounding_box: { x_min: 0.1, y_min: 0.2, x_max: 0.4, y_max: 0.25 } },
  { key: 'last_name', value: 'Kumar', confidence: 0.95, bounding_box: { x_min: 0.5, y_min: 0.2, x_max: 0.8, y_max: 0.25 } },
  { key: 'dob', value: '1985-05-12', confidence: 0.72, bounding_box: { x_min: 0.1, y_min: 0.35, x_max: 0.4, y_max: 0.4 } }, // Low confidence
  { key: 'id_number', value: 'XYZ9876543', confidence: 0.99, bounding_box: { x_min: 0.1, y_min: 0.5, x_max: 0.6, y_max: 0.55 } },
];

export default function ReviewPage() {
  const router = useRouter();
  const { sessionId } = useAppStore();
  
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [fields, setFields] = useState<OCRField[]>(mockExtractedData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: mockExtractedData.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, string>)
  });

  useEffect(() => {
    if (!sessionId) {
      toast.error('Session expired.');
      router.push('/upload');
    }
  }, [sessionId, router]);

  const onSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Document verified and submitted to records.');
      router.push('/records');
    }, 1500);
  };

  const getBoundingBoxStyle = (box: OCRField['bounding_box']) => {
    return {
      left: `${box.x_min * 100}%`,
      top: `${box.y_min * 100}%`,
      width: `${(box.x_max - box.x_min) * 100}%`,
      height: `${(box.y_max - box.y_min) * 100}%`,
    };
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Left Pane: Image & Bounding Boxes */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-[var(--color-surface-lowest)] p-4 flex flex-col relative border-b lg:border-b-0 lg:border-r border-[var(--color-ghost-border)]">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold text-white font-serif">Original Scan</h2>
          <span className="text-xs bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] px-2 py-1 rounded">
            Session: pt_mock_123
          </span>
        </div>
        
        {/* Render Image with SVG/Div Overlays */}
        <div 
          className="flex-1 relative bg-white/5 rounded-md overflow-hidden flex items-center justify-center p-2"
          ref={imageContainerRef}
        >
          {/* Mock image container - in real app this would be an <img /> */}
          <div className="relative w-full max-w-md aspect-[3/4] bg-white text-black p-4 shadow-xl border border-gray-300 mx-auto">
            {/* Mock document visual content */}
            <div className="h-10 w-full mb-6 border-b-2 border-gray-800">
              <h1 className="text-center font-serif text-xl font-bold">Registration Form</h1>
            </div>
            
            {/* Mock text lines matching the OCR coords */}
            <div className="absolute border-b border-gray-300" style={{ top: '24%', left: '10%', right: '10%' }}></div>
            <div className="absolute border-b border-gray-300" style={{ top: '39%', left: '10%', right: '10%' }}></div>
            <div className="absolute border-b border-gray-300" style={{ top: '54%', left: '10%', right: '10%' }}></div>
            
            {/* Draw Bounding Boxes */}
            {fields.map((field) => {
              const isActive = activeFieldKey === field.key;
              const isUncertain = field.confidence < 0.75;
              
              return (
                <div
                  key={field.key}
                  className={`absolute border-2 transition-all duration-200 cursor-pointer text-xs
                    ${isActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20 z-10' : 
                      isUncertain ? 'border-[var(--color-warning)] bg-[var(--color-warning)]/10' : 
                      'border-[var(--color-success)]/40 bg-[var(--color-success)]/5 hover:border-[var(--color-primary)]'
                    }`}
                  style={getBoundingBoxStyle(field.bounding_box)}
                  onClick={() => setActiveFieldKey(field.key)}
                >
                  {isActive && <span className="absolute -top-5 left-0 bg-[var(--color-primary)] text-[var(--color-surface)] px-1 rounded-sm whitespace-nowrap font-bold">{field.key} {Math.round(field.confidence * 100)}%</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Pane: Form & Verification */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-[var(--color-bg)] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-ghost-border)] shrink-0">
          <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
            Data Verification
          </h2>
          <Button variant="secondary" size="sm" className="h-8">
            <Save size={14} className="mr-1" /> Save Draft
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="mb-6 bg-[var(--color-surface-high)] border border-[var(--color-ghost-border)] rounded-md p-3 text-sm text-[var(--color-on-surface-variant)] flex items-start gap-3">
            <AlertTriangle className="text-[var(--color-warning)] shrink-0 mt-0.5" size={18} />
            <p>Please review fields marked in yellow. Confidence is below the 75% threshold mandated for government records.</p>
          </div>

          <form id="verify-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg mx-auto pb-20">
            {mockTemplateFields.map((templateField) => {
              const ocrField = fields.find(f => f.key === templateField.key);
              const isUncertain = ocrField ? ocrField.confidence < 0.75 : true;
              const isActive = activeFieldKey === templateField.key;

              return (
                <div 
                  key={templateField.key}
                  className={`relative p-3 rounded-md border transition-colors ${
                    isActive ? 'border-[var(--color-primary)] bg-[var(--color-surface-high)]' : 
                    isUncertain ? 'border-[var(--color-warning)]/50 bg-[var(--color-warning-bg)]/5' : 
                    'border-[var(--color-ghost-border)] bg-[var(--color-surface-lowest)]'
                  }`}
                  onFocus={() => setActiveFieldKey(templateField.key)}
                  onClick={() => setActiveFieldKey(templateField.key)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-[var(--color-on-surface-variant)]">
                      {templateField.label}
                    </label>
                    {ocrField && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${isUncertain ? 'bg-[var(--color-warning)] text-[var(--color-bg)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                        {Math.round(ocrField.confidence * 100)}% Conf
                      </span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <input
                      {...register(templateField.key)}
                      type={templateField.type}
                      className={`w-full h-10 px-3 rounded text-white outline-none ghost-input
                        ${isActive ? 'bg-[var(--color-surface)] shadow-[0_0_0_1px_var(--color-primary)]' : ''}
                      `}
                    />
                    {isUncertain && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <XCircle size={16} className="text-[var(--color-warning)]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </form>
        </div>

        {/* Action Bar Fixed Bottom */}
        <div className="shrink-0 font-sm p-4 bg-[var(--color-surface)] border-t border-[var(--color-ghost-border)] flex items-center justify-between">
          <p className="text-xs text-[var(--color-on-surface-variant)]">Auto-saved 1m ago</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push('/upload')}>Cancel</Button>
            <Button variant="primary" form="verify-form" type="submit" isLoading={isSubmitting}>
              Submit to Records
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
