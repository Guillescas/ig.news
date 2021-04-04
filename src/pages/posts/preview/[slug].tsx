import Head from 'next/head';
import { GetStaticProps } from "next";
import { RichText } from "prismic-dom";
import Link from 'next/link';
import { useSession } from 'next-auth/client';
import { useEffect } from 'react';
import { useRouter } from 'next/dist/client/router';
import { Session } from 'next-auth';

import { getPrismicClient } from "../../../services/prismic";

import styles from '../post.module.scss';

interface IPostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

interface IUserSubscriptionSession extends Session {
  activeSubscription?: any;
}

type SessionProps = [IUserSubscriptionSession, boolean]

export default function PostPreview({ post }: IPostPreviewProps) {
  const [session]: SessionProps = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>

          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className={`${styles.postContent} ${styles.previewContent}`}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/home">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  };

  return {
    props: {
      post
    }
  }
}
