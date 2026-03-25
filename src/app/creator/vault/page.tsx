import { requireCreator } from "@/lib/guards";
import { readStore } from "@/lib/store";
import VaultManager from "./VaultManager";

type Props = { searchParams: Promise<{ published?: string; saved?: string; error?: string }> };

export default async function CreatorVaultPage({ searchParams }: Props) {
  await requireCreator();
  const sp = await searchParams;
  const { vaultItems } = await readStore();

  return (
    <section className="cr-page">
      <p className="eyebrow">Creator Vault</p>
      <h1 className="section-title">Media Manager</h1>
      <VaultManager
        items={vaultItems}
        published={sp.published === "1"}
        saved={sp.saved === "1"}
        error={sp.error === "empty"}
      />
    </section>
  );
}
