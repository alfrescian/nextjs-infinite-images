import React from 'react';
import Image from 'next/image';
import axios from 'axios';

import {
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from 'react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

function Example() {
  const myLoader = ({ src }) => {
    return src;
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
    <div>
      <h1>Infinite Loading</h1>
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : status === 'error' ? (
        <span>Error: {error.message}</span>
      ) : (
        <>
          {data.pages?.map((page) => (
            <React.Fragment key={page.id}>
              {page.photos.map((photo) => (
                <div style={{ padding: 10 }}>
                  <Image
                    key={photo.id}
                    src={photo.download_url}
                    width={photo.width}
                    height={photo.height}
                    loader={myLoader}
                    unoptimized
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
                ? 'Load Newer'
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
