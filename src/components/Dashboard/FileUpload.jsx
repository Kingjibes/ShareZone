
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { useFiles } from '@/hooks/useFiles';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { encryptFile } from '@/lib/encryption';
import { Upload, FileImage as FileIconLucide, Image, Video, Music, Archive, X, ShieldCheck } from 'lucide-react';

const FileUpload = ({ currentFolder = null }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [encryptFiles, setEncryptFiles] = useState(false);
  const fileInputRef = useRef(null);
  
  const { uploadFile } = useFiles();
  const { user } = useAuth(); 
  const { toast } = useToast();

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return Archive;
    return FileIconLucide;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFiles(Array.from(e.dataTransfer.files)); };
  const handleFileSelect = (e) => { if (e.target.files?.[0]) handleFiles(Array.from(e.target.files)); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleFiles = (newFiles) => {
    const maxFileSize = user?.plan === 'premium' ? 10 * 1024**3 : 5 * 1024**3;
    const validFiles = newFiles.filter(file => {
      if (file.size > maxFileSize) {
        toast({ title: "File too large", description: `${file.name} exceeds the ${formatFileSize(maxFileSize)} limit.`, variant: "destructive" });
        return false;
      }
      return true;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadProgress(prev => { const newProgress = {...prev}; delete newProgress[fileName]; return newProgress; });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    let successCount = 0;

    for (const file of selectedFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        let fileToUpload = file;
        let fileMetadata = { folderId: currentFolder?.id || null, is_encrypted: false, encryption_key: null };

        if (encryptFiles && user?.plan === 'premium') {
            toast({ title: "Encrypting file...", description: `Please wait while ${file.name} is encrypted.` });
            const { encryptedFileBlob, key } = await encryptFile(file);
            fileToUpload = encryptedFileBlob;
            fileMetadata.is_encrypted = true;
            fileMetadata.encryption_key = key;
        }

        await uploadFile(fileMetadata, fileToUpload);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        successCount++;
        
      } catch (error) {
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 })); 
        toast({ title: `Upload failed for ${file.name}`, description: error.message, variant: "destructive" });
      }
    }
    
    if (successCount > 0) toast({ title: "Upload complete!", description: `${successCount} of ${selectedFiles.length} file(s) uploaded successfully.` });
    
    setSelectedFiles(prev => prev.filter(f => uploadProgress[f.name] !== 100));
    setUploading(false);
  };
  
  const maxFileSizeDisplay = user?.plan === 'premium' ? '10 GB' : '5 GB'; 

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`upload-zone rounded-lg p-8 text-center transition-all ${dragActive ? 'border-blue-400 bg-blue-500/20' : ''}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Upload your files</h3>
        <p className="text-gray-400 mb-4">Drag and drop files here, or click to select files</p>
        <Button onClick={() => fileInputRef.current?.click()} className="gradient-bg hover:opacity-90" disabled={uploading}>Select Files</Button>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept="*/*" />
        <p className="text-xs text-gray-500 mt-4">Maximum file size: {maxFileSizeDisplay} per file</p>
      </motion.div>

      {selectedFiles.length > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
          <h4 className="text-lg font-semibold">Selected Files ({selectedFiles.length})</h4>
          {user?.plan === 'premium' && (
            <div className="flex items-center space-x-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <input type="checkbox" id="encrypt-files-checkbox" checked={encryptFiles} onChange={(e) => setEncryptFiles(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <Label htmlFor="encrypt-files-checkbox" className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-green-400" /> Encrypt files (Premium)</Label>
            </div>
          )}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {selectedFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const progress = uploadProgress[file.name];
              return (
                <div key={file.name + file.lastModified} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <FileIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="flex-grow overflow-hidden">
                      <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  {!uploading || progress === undefined || progress >= 100 || progress === -1 ? (
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.name)} className="text-gray-400 hover:text-red-400" disabled={uploading && progress > 0 && progress < 100}><X className="w-4 h-4" /></Button>
                  ) : null}
                  {uploading && progress !== undefined && progress >= 0 && progress < 100 && <Progress value={progress} className="w-24 h-2" />}
                  {progress === 100 && <div className="text-sm text-green-400">Done</div>}
                  {progress === -1 && <div className="text-sm text-red-400">Error</div>}
                </div>
              );
            })}
          </div>
          <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0} className="w-full gradient-bg hover:opacity-90">
            {uploading ? "Uploading..." : <><Upload className="w-4 h-4 mr-2" />Upload {selectedFiles.length} file(s)</>}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
