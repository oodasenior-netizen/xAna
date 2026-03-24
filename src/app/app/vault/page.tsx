import { requireSubscriber } from "@/lib/guards";
import { readStore } from "@/lib/store";
import { VaultGrid } from "./VaultGrid";

export default async function BodegaPage() {
  const session = await requireSubscriber();
  const { vaultItems } = readStore();

  return (
    <section className="vault-page">
      <h1 className="section-title">La Bodega</h1>
      <p className="vault-intro">Private reserves — curated, aged to perfection.</p>
      <VaultGrid items={vaultItems} ownedContent={session.ownedContent} />
    </section>
  );
}