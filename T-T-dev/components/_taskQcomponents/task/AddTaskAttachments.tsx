"use client";

import { useRef } from "react";
import { FileText, Image as ImageIcon, X, Upload } from "lucide-react";

interface AttachmentProps {
  files: File[];
  onAdd: (newFiles: FileList | null) => void;
  onRemove: (index: number) => void;
}

export const AddTaskAttachments = ({
  files,
  onAdd,
  onRemove,
}: AttachmentProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className=" animate-in fade-in duration-300">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#30493b] hover:bg-slate-50 transition-all"
      >
        <Upload className="text-slate-400 mb-2" size={24} />
        <p className="text-xs text-slate-500 font-medium">
          Click to upload Images or Documents
        </p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => onAdd(e.target.files)}
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        {files.map((file, i) => {
          const isImage = file.type.startsWith("image/");
          return (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-white border rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                {isImage ? (
                  <ImageIcon size={18} className="text-blue-500" />
                ) : (
                  <FileText size={18} className="text-orange-500" />
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemove(i)}
                className="p-1 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
