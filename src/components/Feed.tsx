import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import TweetInput from './TweetInput';
import styles from './Feed.module.css';
import Post from './Post';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      id: '',
      avatar: '',
      image: '',
      text: '',
      timestamp: null,
      userName: '',
    },
  ]);

  useEffect(() => {
    const unSub = db
      .collection('posts')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) =>
        setPosts(
          snapshot.docs.map((doc) => ({
            key: doc.id,
            id: doc.id,
            avatar: doc.data().avatar,
            image: doc.data().image,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
            userName: doc.data().userName,
          }))
        )
      );
    return () => {
      unSub();
    };
  }, []);

  return (
    <div className={styles.feed}>
      Feed
      <TweetInput />
      {posts[0]?.id && [
        <>
          {posts.map((post) => (
            <Post
              key={post.id}
              postId={post.id}
              avatar={post.avatar}
              image={post.image}
              text={post.text}
              timestamp={post.timestamp}
              userName={post.userName}
            />
          ))}
        </>,
      ]}
    </div>
  );
};

export default Feed;
