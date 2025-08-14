import React from "react";

interface PostImageGalleryProps {
  images: string[];
}

const PostImageGallery: React.FC<PostImageGalleryProps> = ({ images }) => {
  if (!images.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded overflow-hidden">
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt="Post image"
          className="object-cover w-full h-40 rounded shadow"
          loading="lazy"
        />
      ))}
    </div>
  );
};

export default PostImageGallery;
