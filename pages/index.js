import React from 'react';
import Image from 'next/image';
import axios from 'axios';

import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from 'react-query';
const sizes = `
    (min-width: 1020px) 1000px,
    calc(100vw - 20px)`;

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

function Example() {
  const myLoader = ({ src, width }) => {
    return `https://picsum.photos/id/${src}/${width}/${width}`;
  };

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    'projects',
    async ({ pageParam = 1 }) => {
      const res = await axios.get(
        `https://picsum.photos/v2/list?page=${pageParam}&limit=50`
      );

      return { photos: res.data, nextPage: pageParam + 1 };
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage ?? false,
    }
  );

  return (
    <div style={{ maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1>Infinite Loading</h1>
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : status === 'error' ? (
        <span>Error: {error.message}</span>
      ) : (
        <>
          {data.pages?.map((page, i) => (
            <React.Fragment key={i}>
              {page.photos.map((photo) => (
                <div style={{ padding: 10 }} key={photo.id}>
                  <Image
                    src={photo.id}
                    width={photo.width}
                    height={photo.width}
                    loader={myLoader}
                    sizes={sizes}
                    layout="responsive"
                  />
                </div>
              ))}
            </React.Fragment>
          ))}
          <div>
            <button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? 'Loading more...'
                : hasNextPage
                ? 'Load More'
                : 'Nothing more to load'}
            </button>
          </div>
          <div>
            {isFetching && !isFetchingNextPage
              ? 'Background Updating...'
              : null}
          </div>
        </>
      )}
    </div>
  );
}
