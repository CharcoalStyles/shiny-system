import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";

type Artifact = {
  image: string;
  prompt: string;
  negative: string;
  tags: Record<string, string>;
  type: string;
  model: string;
};

export default function Home() {
  const router = useRouter();
  const { id } = router.query;

  const [artifact, setArtifact] = useState<Artifact>();

  useEffect(() => {
    axios
      .get<Artifact>(`http://localhost:3000/api/artifact/${id}`)
      .then(({ data }) => {
        setArtifact(data);
      })
      .catch((err) => {
        console.error(err);
        router.push("/");
      });
  }, [id]);

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
        <section className="bg-gray-100 pt-24 pb-8 h-screen">
          <div className="container mx-auto px-4">
            {artifact ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <img
                    src={`data:image/jpg;base64,${artifact.image}`}
                    alt={artifact.prompt}
                  />
                </div>
                <div className="text-black">
                  <h2 className="font-bold mb-4">{artifact.prompt}</h2>
                  <p className="mb-2">
                    <span className="font-bold">Negative:</span>{" "}
                    {artifact.negative}
                  </p>
                  {artifact.model !== "unknown" && (
                    <p className="mb-2">
                      <span className="font-bold">Model:</span> {artifact.model}
                    </p>
                  )}
                  {Object.entries(artifact.tags).map(([key, value]) => (
                    <p className="mb-2" key={key}>
                      <span className="font-bold">{key}:</span> {value}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
