import React, { useEffect, useState } from "react";
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType }) => {
  // Dynamically determine the endpoint based on feedType
  const getPostEndPoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndPoint();

  // Use useQuery to fetch posts
  const {
    data: posts,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts", feedType],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false, 
  });


  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  return (
    <>
      {/* Display skeleton loader while loading */}
      {(isLoading || isFetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {/* Display message if no posts */}
      {!isLoading && !isFetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {/* Display posts */}
      {!isLoading && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
      {/* Handle API errors */}
      {error && (
        <div className="text-center text-red-600 my-4">
          <p>Error loading posts: {error.message}</p>
        </div>
      )}
    </>
  );
};

export default Posts;
