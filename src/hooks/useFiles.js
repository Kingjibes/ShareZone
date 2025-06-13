
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export const useFiles = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUserFiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadUserFolders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserFiles();
      loadUserFolders();
    } else {
      setFiles([]);
      setFolders([]);
    }
  }, [user, loadUserFiles, loadUserFolders]);

  const uploadFile = async (fileData, actualFile) => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    try {
      const filePath = `${user.id}/${Date.now()}_${actualFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('sharezone_files')
        .upload(filePath, actualFile);

      if (uploadError) {
        console.error('Storage Upload Error:', uploadError);
        throw uploadError;
      }
      
      const newFile = {
        user_id: user.id,
        name: actualFile.name,
        size: actualFile.size,
        type: actualFile.type,
        path_in_storage: filePath,
        folder_id: fileData.folderId || null,
        is_encrypted: fileData.is_encrypted,
        encryption_key: fileData.encryption_key
      };

      const { data: dbFile, error: dbError } = await supabase
        .from('files')
        .insert(newFile)
        .select()
        .single();

      if (dbError) {
        console.error('DB Insert Error:', dbError);
        await supabase.storage.from('sharezone_files').remove([filePath]);
        throw dbError;
      }
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('storage_used')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      const newStorageUsed = (userData?.storage_used || 0) + actualFile.size;
      await supabase
        .from('users')
        .update({ storage_used: newStorageUsed })
        .eq('id', user.id);
      
      loadUserFiles(); 
      return dbFile;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    try {
      const { data: fileToDelete, error: fetchError } = await supabase
        .from('files')
        .select('path_in_storage, size')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !fileToDelete) throw fetchError || new Error("File not found or unauthorized");

      const { error: storageError } = await supabase.storage
        .from('sharezone_files')
        .remove([fileToDelete.path_in_storage]);

      if (storageError) {
        console.warn('Storage delete error (proceeding with DB delete):', storageError);
      }

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('storage_used')
        .eq('id', user.id)
        .single();
      
      if (userError) throw userError;

      const newStorageUsed = Math.max(0, (userData?.storage_used || 0) - fileToDelete.size);
      await supabase
        .from('users')
        .update({ storage_used: newStorageUsed })
        .eq('id', user.id);

      loadUserFiles();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (folderData) => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    try {
      const newFolder = {
        user_id: user.id,
        name: folderData.name,
        parent_id: folderData.parentId || null,
      };
      const { data, error } = await supabase
        .from('folders')
        .insert(newFolder)
        .select()
        .single();
      
      if (error) throw error;
      loadUserFolders();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteFolder = async (folderId) => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    try {
      const { data: filesInFolder } = await supabase
        .from('files')
        .select('id', { count: 'exact', head: true })
        .eq('folder_id', folderId);

      if (filesInFolder && filesInFolder.count > 0) throw new Error("Cannot delete a non-empty folder. Please delete all files inside first.");
      
      const { data: subfolders } = await supabase
        .from('folders')
        .select('id', { count: 'exact', head: true })
        .eq('parent_id', folderId);

      if (subfolders && subfolders.count > 0) throw new Error("Cannot delete a folder with subfolders. Please delete subfolders first.");

      const { error: deleteError } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      loadUserFolders();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = async (fileId, options = {}) => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    try {
      const shareId = Math.random().toString(36).substring(2, 12); 
      const sharedLink = `${window.location.origin}/share/${shareId}`;
      
      const updateData = {
        share_id: shareId,
        is_public: options.isPublic === undefined ? true : options.isPublic,
        share_password: options.password || null,
        share_expires_at: options.expiresAt || null,
      };

      const { data, error } = await supabase
        .from('files')
        .update(updateData)
        .eq('id', fileId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      loadUserFiles();
      return sharedLink;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFileByShareId = async (shareId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*, users (username, email)')
        .eq('share_id', shareId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching file by shareId:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const incrementDownloadCount = async (fileId) => {
    try {
      const { error } = await supabase.rpc('increment_download_count', { file_id_param: fileId });
      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };

  return {
    files,
    folders,
    loading,
    uploadFile,
    deleteFile,
    createFolder,
    deleteFolder,
    generateShareLink,
    getFileByShareId,
    incrementDownloadCount,
    loadUserFiles,
    loadUserFolders,
  };
};
