
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FileUpload from '@/components/Dashboard/FileUpload';
import FileGrid from '@/components/Dashboard/FileGrid';
import { useAuth } from '@/hooks/useAuth';
import { useFiles } from '@/hooks/useFiles';
import { useToast } from '@/components/ui/use-toast';
import { 
  Upload, 
  Search, 
  FolderPlus, 
  Grid3X3, 
  List,
  HardDrive,
  Share2,
  Crown,
  Download as DownloadIcon,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth(); 
  const { files, folders, createFolder, loading: filesLoading } = useFiles();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); 
  const [currentFolder, setCurrentFolder] = useState(null); 
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [path, setPath] = useState([]);

  useEffect(() => {
    const buildPath = (folderId) => {
      let current = folders.find(f => f.id === folderId);
      const newPath = [];
      while (current) {
        newPath.unshift(current);
        current = folders.find(f => f.id === current.parent_id);
      }
      setPath(newPath);
    };

    if (currentFolder) {
      buildPath(currentFolder.id);
    } else {
      setPath([]);
    }
  }, [currentFolder, folders]);

  const storageUsed = user?.storage_used || 0;
  const storageLimit = user?.plan === 'premium' ? 10 * 1024**4 : 5 * 1024**3;
  const storagePercentage = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

  const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user) return;
    
    try {
      await createFolder({
        name: newFolderName,
        parent_id: currentFolder?.id || null,
      });
      setNewFolderName('');
      setShowNewFolder(false);
      toast({ title: "Folder created!", description: `Folder "${newFolderName}" has been created.`});
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast({ title: "Folder creation failed", description: error.message, variant: "destructive"});
    }
  };
  
  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
  }

  const handleBreadcrumbClick = (folderId) => {
    if (folderId === null) {
      setCurrentFolder(null);
    } else {
      const folder = folders.find(f => f.id === folderId);
      setCurrentFolder(folder);
    }
  };

  const filteredFiles = useMemo(() => files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [files, searchQuery]);
  
  const totalDownloads = files.reduce((total, file) => total + (file.downloads || 0), 0);

  const stats = [
    { title: "Total Files", value: files.length, icon: Upload, color: "text-blue-400" },
    { title: "Storage Used", value: formatFileSize(storageUsed), icon: HardDrive, color: "text-green-400" },
    { title: "Shared Links", value: files.filter(f => f.share_id).length, icon: Share2, color: "text-purple-400" },
    { title: "Total Downloads", value: totalDownloads, icon: DownloadIcon, color: "text-orange-400" }
  ];

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Welcome back, {user?.username || user?.email}!</h1>
              <p className="text-gray-400">Manage your files and folders with ShareZone.</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              {user?.plan === 'premium' && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-500/20 rounded-full">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500 capitalize">{user.plan}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="glass-effect border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><HardDrive className="w-5 h-5" /><span>Storage Usage</span></CardTitle>
              <CardDescription>{formatFileSize(storageUsed)} of {formatFileSize(storageLimit)} used</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={storagePercentage} className="w-full" />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{storagePercentage.toFixed(1)}% used</span>
                <span>{formatFileSize(storageLimit - storageUsed)} remaining</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Tabs defaultValue="files" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">My Files</TabsTrigger>
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Search files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" /></div>
                  <Button variant="outline" size="sm" onClick={() => setShowNewFolder(!showNewFolder)}><FolderPlus className="w-4 h-4 mr-2" />New Folder</Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid3X3 className="w-4 h-4" /></Button>
                  <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => { toast({ title: "🚧 List view coming soon!", description: "You can request this feature in your next prompt! 🚀" }); }}><List className="w-4 h-4" /></Button>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-400">
                <button onClick={() => handleBreadcrumbClick(null)} className="hover:text-white">Home</button>
                {path.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <button onClick={() => handleBreadcrumbClick(folder.id)} className="hover:text-white truncate" title={folder.name}>
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {showNewFolder && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center space-x-2">
                  <Input placeholder="Folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()} className="max-w-xs" />
                  <Button onClick={handleCreateFolder} size="sm">Create</Button>
                  <Button variant="outline" size="sm" onClick={() => { setShowNewFolder(false); setNewFolderName(''); }}>Cancel</Button>
                </motion.div>
              )}
              
              {filesLoading ? (
                 <div className="min-h-[200px] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div></div>
              ) : (
                <FileGrid files={filteredFiles} folders={folders} currentFolder={currentFolder} onFolderClick={handleFolderClick} />
              )}
            </TabsContent>

            <TabsContent value="upload">
              <FileUpload currentFolder={currentFolder} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
