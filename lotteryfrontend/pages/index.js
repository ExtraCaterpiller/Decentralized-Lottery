import Image from "next/image";
import Head from "next/head";
import Header from "@/components/Header";
import LotteryEntrance from "@/components/LotteryEntrance";

export default function Home() {
  return (
    <>
        <Head>
            <title>Smart Contract Lottery</title>
            <meta name="Home" content="Welcome to the Smart Contract Lottery application." />
        </Head>
        <main className="">
            <Header />
            <LotteryEntrance />
        </main>
    </>
  );
}
