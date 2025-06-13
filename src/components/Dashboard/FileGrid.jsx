
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFiles } from '@/hooks/useFiles';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { decryptFile } from '@/lib/encryption';
import { 
  FileText as FileIconLucide, Image, Video, Music, Archive, Download, Share2, Trash2, Eye, Copy, Lock, Calendar, MoreVertical, Folder as FolderIcon, FolderOpen, ShieldCheck,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const FileGrid = ({ files, folders, currentFolder, onFolderClick }) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareOptions, setShareOptions] = useState({ isPublic: true, password: '', expiresAt: '' });
  
  const { deleteFile, deleteFolder, generateShareLink, incrementDownloadCount } = useFiles();
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

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFile(fileId);
      toast({ title: "File deleted", description: "File has been successfully deleted." });
    } catch (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };
  
  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolder(folderId);
      toast({ title: "Folder deleted", description: "Folder has been successfully deleted."});
    } catch (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!selectedFile) return;
    try {
      const shareLink = await generateShareLink(selectedFile.id, {
        isPublic: shareOptions.isPublic,
        password: shareOptions.password,
        expiresAt: shareOptions.expiresAt ? new Date(shareOptions.expiresAt).toISOString() : null
      });
      
      await navigator.clipboard.writeText(shareLink);
      toast({ title: "Share link created!", description: "Link has been copied to your clipboard." });
      setShareDialogOpen(false);
      setSelectedFile(null);
      setShareOptions({ isPublic: true, password: '', expiresAt: '' });
    } catch (error) {
      toast({ title: "Share failed", description: error.message, variant: "destructive" });
    }
  };

  const handleDownload = async (file) => {
    if (!file || !file.path_in_storage) return;
    toast({ title: "Preparing download...", description: `Please wait...` });
    try {
      const { data, error } = await supabase.storage.from('sharezone_files').download(file.path_in_storage);
      if (error) throw error;
      
      let blob = data;
      let fileName = file.name;

      if(file.is_encrypted) {
        toast({ title: "Decrypting file...", description: "This might take a moment for large files." });
        const decryptedBlob = await decryptFile(blob, file.encryption_key);
        blob = decryptedBlob;
      }
      
      await incrementDownloadCount(file.id);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      toast({ title: "Download started", description: `Downloading ${fileName}...` });
    } catch (downloadError) {
       console.error("Download error from FileGrid:", downloadError);
       toast({ title: "Download Failed", description: downloadError.message || "Could not download the file.", variant: "destructive" });
    }
  };

  const currentParentId = currentFolder ? currentFolder.id : null;
  const filteredFolders = folders.filter(folder => folder.parent_id === currentParentId);
  const filteredFiles = files.filter(file => file.folder_id === currentParentId);

  if (filteredFiles.length === 0 && filteredFolders.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">This folder is empty</h3>
        <p className="text-gray-500">Upload files or create a subfolder to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFolders.map((folder, index) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="file-card rounded-lg p-4 group cursor-pointer"
            onDoubleClick={() => onFolderClick(folder)}
          >
            <div className="flex items-start justify-between mb-3">
              <FolderIcon className="w-8 h-8 text-yellow-400" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onFolderClick(folder)}><FolderOpen className="w-4 h-4 mr-2" />Open</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {toast({title: "🚧 Coming Soon!"})}}><Trash2 className="w-4 h-4 mr-2" />Rename</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)} className="text-red-400 focus:text-red-400"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm truncate" title={folder.name}>{folder.name}</h4>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Folder</span>
                <span>{formatDate(folder.created_at)}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredFiles.map((file, index) => {
          const FileIcon = getFileIcon(file.type);
          return (
            <motion.div key={file.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (filteredFolders.length + index) * 0.05 }} className="file-card rounded-lg p-4 group">
              <div className="flex items-start justify-between mb-3">
                <FileIcon className="w-8 h-8 text-blue-400" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file)}><Download className="w-4 h-4 mr-2" />Download</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSelectedFile(file); setShareOptions({ isPublic: file.is_public === undefined ? true : file.is_public, password: file.share_password || '', expiresAt: file.share_expires_at ? new Date(file.share_expires_at).toISOString().slice(0,16) : '' }); setShareDialogOpen(true); }}><Share2 className="w-4 h-4 mr-2" />Share</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDeleteFile(file.id)} className="text-red-400 focus:text-red-400"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm truncate" title={file.name}>{file.name}</h4>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.uploaded_at)}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs mt-1">
                  {file.is_encrypted && (<div className="flex items-center space-x-1 text-green-400"><ShieldCheck className="w-3 h-3" /><span>Encrypted</span></div>)}
                  {file.share_id && (<div className="flex items-center space-x-1 text-purple-400"><Share2 className="w-3 h-3" /><span>Shared</span>{file.share_password && <Lock className="w-3 h-3" />}{file.share_expires_at && <Calendar className="w-3 h-3" />}</div>)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
            <DialogDescription>Configure sharing options for {selectedFile?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex space-x-4">
                <Button variant={shareOptions.isPublic ? "default" : "outline"} size="sm" onClick={() => setShareOptions(prev => ({ ...prev, isPublic: true }))}><Eye className="w-4 h-4 mr-2" />Public</Button>
                <Button variant={!shareOptions.isPublic ? "default" : "outline"} size="sm" onClick={() => setShareOptions(prev => ({ ...prev, isPublic: false, password: '' }))}><Lock className="w-4 h-4 mr-2" />Private (link only)</Button>
              </div>
               <p className="text-xs text-gray-400">Public files can be found by anyone. Private files require the direct link.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password Protection (Optional)</Label>
              <Input id="password" type="password" placeholder="Enter password" value={shareOptions.password} onChange={(e) => setShareOptions(prev => ({ ...prev, password: e.target.value }))} />
               <p className="text-xs text-gray-400">If set, users will need this password to access the file via the shared link.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">Expiration Date (Optional)</Label>
              <Input id="expires" type="datetime-local" value={shareOptions.expiresAt} onChange={(e) => setShareOptions(prev => ({ ...prev, expiresAt: e.target.value }))} min={new Date().toISOString().slice(0, 16)} />
               <p className="text-xs text-gray-400">The link will automatically expire after this date.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleShare} className="gradient-bg"><Copy className="w-4 h-4 mr-2" />Create & Copy Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileGrid;
