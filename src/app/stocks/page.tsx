import StocksClient from "@/components/StocksClient";

export default function StocksPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Nifty 50 Analysis</h1>
      <StocksClient />
    </div>
  );
}
