import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";

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
      .then(({data: {artifacts}}) => {
        console.log(artifacts);
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
        <header className="bg-gray-800 text-white fixed w-full  top-0 z-10">
          <div className="container mx-auto py-4 px-5 flex justify-center items-center">
            <h1 className="text-3xl font-bold">AItifacts</h1>
          </div>
        </header>
        <section className="bg-gray-100 pt-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap -mx-4">
              {artifacts.map((artifact) => (
                <div className="w-full md:w-1/3 lg:w-1/4 px-4 mb-8">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img
                      src={`data:image/jpg;base64,${artifact.thumbnail}`}
                      alt="Artifact"
                      className="w-full h-64 object-cover object-center"
                    />
                    <div className="p-4">
                      <h1 className="text-xl font-semibold text-gray-800">
                        #{artifact.id.split("-").slice(1,3).join("-")}
                      </h1>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
