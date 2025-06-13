
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFiles } from '@/hooks/useFiles';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { decryptFile } from '@/lib/encryption';
import { 
  FileText, 
  Download, 
  Lock, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  UserCircle, 
  ExternalLink,
  Loader2,
  KeyRound
} from 'lucide-react';

const SharePage = () => {
  const { shareId } = useParams();
  const { getFileByShareId, incrementDownloadCount } = useFiles();
  const { toast } = useToast();

  const [file, setFile] = useState(null);
  const [uploaderInfo, setUploaderInfo] = useState(null);
  const [pageState, setPageState] = useState('loading'); // loading, error, password, ready
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessingPassword, setIsProcessingPassword] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchFileDetails = useCallback(async () => {
    if (!shareId) {
      setErrorMessage("Invalid share link. No Share ID provided.");
      setPageState('error');
      return;
    }

    setPageState('loading');
    try {
      const sharedFile = await getFileByShareId(shareId);

      if (!sharedFile) {
        setErrorMessage("File not found or the share link is invalid.");
        setPageState('error');
        return;
      }

      if (sharedFile.share_expires_at && new Date(sharedFile.share_expires_at) < new Date()) {
        setErrorMessage("This share link has expired.");
        setPageState('error');
        return;
      }
      
      setFile(sharedFile);
      if (sharedFile.users) {
        setUploaderInfo({ username: sharedFile.users.username, email: sharedFile.users.email });
      }


      if (sharedFile.share_password) {
        setPageState('password');
      } else {
        setPageState('ready');
      }
    } catch (err) {
      console.error("Error fetching shared file:", err);
      setErrorMessage("An unexpected error occurred while trying to retrieve file details. Please try again later.");
      setPageState('error');
    }
  }, [shareId, getFileByShareId]);

  useEffect(() => {
    fetchFileDetails();
  }, [fetchFileDetails]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!file || !file.share_password) return;

    setIsProcessingPassword(true);
    // Simulate a slight delay for better UX, as password check might be too fast
    await new Promise(resolve => setTimeout(resolve, 500));

    if (file.share_password === password) {
      setPageState('ready');
      toast({ 
        title: "Access Granted!", 
        description: "You can now download the file.",
        className: "bg-green-500 border-green-700 text-white"
      });
    } else {
      setErrorMessage("Incorrect password. Please try again.");
      toast({ 
        title: "Access Denied", 
        description: "The password you entered is incorrect.",
        variant: "destructive" 
      });
    }
    setIsProcessingPassword(false);
  };

  const handleDownload = async () => {
    if (!file || pageState !== 'ready' || !file.path_in_storage || isDownloading) return;
    
    setIsDownloading(true);
    toast({ 
      title: "Download Initiated", 
      description: `Preparing ${file.name} for download...`,
      className: "bg-blue-500 border-blue-700 text-white"
    });

    try {
      const { data, error: downloadError } = await supabase.storage
        .from('sharezone_files')
        .download(file.path_in_storage);

      if (downloadError) throw downloadError;

      let blob = data;
      let fileName = file.name;

      if (file.is_encrypted && file.encryption_key) {
        toast({ 
          title: "Decrypting File...", 
          description: "This may take a moment for large files.",
          className: "bg-purple-500 border-purple-700 text-white"
        });
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

      toast({
        title: "Download Started!",
        description: `${fileName} is now downloading.`,
        className: "bg-green-500 border-green-700 text-white"
      });
      // Refresh file data to show updated download count, if desired
      // fetchFileDetails(); 
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Download Failed",
        description: err.message || "Could not download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center p-10">
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mb-6" />
            <p className="text-xl font-semibold gradient-text">Loading File Details...</p>
            <p className="text-gray-400">Please wait while we fetch the information.</p>
          </div>
        );
      case 'error':
        return (
          <Card className="w-full max-w-md bg-red-900/30 border-red-500/50 backdrop-blur-md">
            <CardHeader className="items-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
              <CardTitle className="text-3xl font-bold text-red-300">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-red-200 text-lg mb-6">{errorMessage}</p>
              <Button asChild className="gradient-bg hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                <Link to="/">
                  <ExternalLink className="mr-2 h-5 w-5" /> Go to Homepage
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      case 'password':
        return (
          <Card className="w-full max-w-md bg-slate-800/30 border-slate-600/50 backdrop-blur-md">
            <CardHeader className="items-center">
              <KeyRound className="w-16 h-16 text-yellow-400 mb-4" />
              <CardTitle className="text-3xl font-bold gradient-text">Password Required</CardTitle>
              <CardDescription className="text-gray-300">
                This file is protected. Please enter the password to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="share-password" className="text-gray-200 font-semibold mb-2 block">Password</Label>
                  <Input
                    id="share-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-slate-700/50 border-slate-500 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-bg hover:opacity-90 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center" 
                  disabled={isProcessingPassword}
                >
                  {isProcessingPassword ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-5 w-5" />
                  )}
                  {isProcessingPassword ? 'Verifying...' : 'Unlock File'}
                </Button>
              </form>
              {errorMessage && pageState === 'password' && <p className="text-red-400 text-sm mt-4 text-center">{errorMessage}</p>}
            </CardContent>
          </Card>
        );
      case 'ready':
        if (!file) return null; // Should not happen if pageState is ready
        return (
          <Card className="w-full max-w-2xl bg-slate-800/30 border-slate-600/50 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4 mb-4">
                <FileText className="w-16 h-16 text-blue-400 flex-shrink-0" />
                <div>
                  <CardTitle className="text-3xl font-bold gradient-text leading-tight break-all" title={file.name}>
                    {file.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300 mt-1">
                    Ready for download
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <span className="font-semibold text-gray-300">File Size:</span>
                  <span className="text-gray-200 ml-2">{formatFileSize(file.size)}</span>
                </div>
                <div className="bg-slate-700/30 p-3 rounded-md">
                  <span className="font-semibold text-gray-300">File Type:</span>
                  <span className="text-gray-200 ml-2">{file.type || 'Unknown'}</span>
                </div>
                {file.is_encrypted && (
                  <div className="md:col-span-2 bg-green-800/30 p-3 rounded-md flex items-center">
                    <ShieldCheck className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                    <span className="font-semibold text-green-300">This file is end-to-end encrypted.</span>
                  </div>
                )}
                {file.share_expires_at && (
                  <div className="md:col-span-2 bg-yellow-800/30 p-3 rounded-md flex items-center">
                    <Clock className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" />
                    <span className="font-semibold text-yellow-300">
                      Link expires: {new Date(file.share_expires_at).toLocaleString()}
                    </span>
                  </div>
                )}
                 {uploaderInfo && (
                  <div className="md:col-span-2 bg-slate-700/30 p-3 rounded-md flex items-center">
                    <UserCircle className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0" />
                    <span className="font-semibold text-gray-300">Shared by:</span>
                    <span className="text-purple-300 ml-2">{uploaderInfo.username || uploaderInfo.email}</span>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleDownload} 
                size="lg" 
                className="w-full gradient-bg hover:opacity-90 text-white font-bold py-4 text-lg rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  <Download className="mr-2 h-6 w-6" />
                )}
                {isDownloading ? 'Downloading...' : 'Download File'}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Total Downloads: {file.downloads || 0}
              </p>
            </CardContent>
            <CardFooter className="pt-6 justify-center">
              <Link to="/" className="text-sm text-purple-400 hover:text-purple-300 transition-colors hover:underline flex items-center">
                <ExternalLink className="mr-1 h-4 w-4" /> Back to ShareZone
              </Link>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={pageState}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SharePage;
