
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Play } from 'lucide-react';

interface VideoUploadProps {
  onVideoUploaded: (url: string) => void;
  currentVideo?: string;
  bucket: string;
  folder: string;
}

const VideoUpload = ({ onVideoUploaded, currentVideo, bucket, folder }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentVideo || '');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const videoUrl = urlData.publicUrl;
      setPreview(videoUrl);
      onVideoUploaded(videoUrl);

      toast({
        title: "Success",
        description: "Video uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setPreview('');
    onVideoUploaded('');
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <video 
            src={preview} 
            controls
            className="w-full max-w-md h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeVideo}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <Label htmlFor="video-upload" className="cursor-pointer">
            <span className="text-blue-600 hover:text-blue-700">Click to upload video</span>
            <span className="text-gray-600"> (MP4, WebM, etc.)</span>
          </Label>
        </div>
      )}
      <Input
        id="video-upload"
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
      />
      {uploading && <p className="text-sm text-gray-600">Uploading video...</p>}
    </div>
  );
};

export default VideoUpload;
