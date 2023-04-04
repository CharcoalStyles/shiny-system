import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import { Heading } from "@/components/heading";

type Artifact = {
  id: string;
  thumbnail: string;
};

export default function Home() {
  const [artifacts, setArtifacts] = useState<Array<Artifact>>([]);

  useEffect(() => {
    axios
      .get<{ artifacts: Array<Artifact>; lastKey?: string }>(
        "http://localhost:3000/api/artifacts"
      )
      .then(({ data: { artifacts } }) => {
        setArtifacts(artifacts);
      });
  }, []);

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
              {artifacts.map((artifact) => (
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
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
