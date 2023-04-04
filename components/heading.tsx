import Link from "next/link";
import KofiButton from "kofi-button";

const kofiID = process.env.KOFI_ID ? process.env.KOFI_ID : "";

export const Heading = () => {
  return (
    <header className="bg-plum-800 text-white fixed w-full  top-0 z-10">
      <div className="container mx-auto py-4 px-5 flex justify-center items-center">
        <Link href="/">
          <h1 className="text-3xl font-bold">AItifacts</h1>
        </Link>
        <div className="ml-auto">
          <KofiButton color="#44023c" title="" kofiID={kofiID} />
        </div>
      </div>
    </header>
  );
};
