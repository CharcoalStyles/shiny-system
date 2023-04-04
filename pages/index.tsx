import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import useSWRInfinite, { SWRInfiniteResponse } from "swr/infinite";
import InfiniteScroll from "react-swr-infinite-scroll";
import { Heading } from "@/components/heading";

type Artifact = {
  id: string;
  thumbnail: string;
};

type ArtifactPage = {
  artifacts: Array<Artifact>;
  lastKey?: string;
};

export default function Home() {
  const swr = useSWRInfinite<ArtifactPage>(
    (index: any, prev: ArtifactPage) => {
      if (!prev) {
        return "/api/artifacts";
      }
      if (prev && !prev.lastKey) {
        return null;
      }
      return `/api/artifacts?lastKey=${prev?.lastKey}`;
    },
    {
      fetcher: async (url: string | null) =>
        url && (await axios.get(url).then((res) => res.data)),
    }
  );

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AItifacts</title>
      </Head>
      <main>
        <Heading />
        <section className="bg-gray-100 pt-24" style={{ minHeight: "100vh" }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap -mx-4">
              <InfiniteScroll
                swr={swr}
                loadingIndicator={<p>Loading</p>}
                isReachingEnd={(swr: SWRInfiniteResponse<ArtifactPage>) =>
                  !swr.data?.[swr.data?.length - 1]?.lastKey ?? false
                }
              >
                {(response: ArtifactPage) =>
                  response.artifacts.map((artifact) => (
                    <ArtifactCard artifact={artifact} />
                  ))
                }
              </InfiniteScroll>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
function ArtifactCard({ artifact }: { artifact: Artifact }): JSX.Element {
  return (
    <Link
      className="w-full md:w-1/3 lg:w-1/4 px-4 mb-8"
      href={`/${artifact.id}`}
      key={artifact.id}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <img
          src={`data:image/jpg;base64,${artifact.thumbnail}`}
          alt="Artifact"
          className="w-full h-64 object-cover object-center"
        />
        <div className="p-4">
          <h1 className="text-xl font-semibold text-plum-700">
            #{artifact.id.split("-").slice(1, 3).join("-")}
          </h1>
        </div>
      </div>
    </Link>
  );
}
