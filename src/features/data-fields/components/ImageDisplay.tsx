import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

// Define props interface for TypeScript
interface ImageDisplayProps {
  imagePath: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imagePath }) => {
  const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/upload-doc`;

  // Function to fetch the image using axios
  const fetchImage = async (): Promise<string> => {
    if (!imagePath) {
      throw new Error("Image path is required");
    }

    try {
      const response = await axiosInstance.get(
        `${baseAPIURL}?fileurl=${imagePath}`,
        {
          responseType: "blob",
        },
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch image: ${error.response?.status} ${error.message}`,
        );
      }
      throw new Error("Failed to fetch image");
    }
  };

  // Use Tanstack Query to handle the data fetching
  const { data: imageUrl, isLoading } = useQuery<string, Error>({
    queryKey: ["image", imagePath],
    queryFn: fetchImage,
    enabled: !!imagePath,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded text-xs text-muted-foreground">
        Updating annotation...
      </div>
    );
  }

  return <div>{imageUrl && <img src={imageUrl} alt={""} />}</div>;
};

export default ImageDisplay;
