import {
  assertTarget,
  pendingCleanup,
} from "../../scripts/database-cleanup/guards";

const approved = [
  "AlignActiveDatabaseIntegrity1793574441324",
  "MarkKnownLegacySaveDatesUnknown1793574441325",
];
const branch = {
  id: "br-wispy-forest-audpsdxp",
  project_id: "fragrant-flower-02125519",
  name: "dev",
};
const host = "ep-dawn-waterfall-aualz1hc.c-10.us-east-1.aws.neon.tech";
const url = `postgresql://test@${host}/neondb?sslmode=require`;

describe("cleanup target and pending-migration guards", () => {
  test("accepts the API-verified direct active target", () => {
    expect(() => assertTarget(branch, host, url)).not.toThrow();
  });

  test("requires the rehearsal label to match its exact active parent", () => {
    const target = {
      ...branch,
      id: "rehearsal",
      name: "cleanup-review-staging-20261101",
      parent_id: "br-crimson-sound-auy345bq",
    };
    expect(() => assertTarget(target, host, url)).not.toThrow();
    expect(() =>
      assertTarget(
        { ...target, parent_id: "br-weathered-wave-au5ygpff" },
        host,
        url,
      ),
    ).toThrow();
    expect(() =>
      assertTarget({ ...target, name: "migration-review-prod" }, host, url),
    ).toThrow();
    expect(() =>
      assertTarget(
        { ...target, name: "cleanup-review-staging-../../other" },
        host,
        url,
      ),
    ).toThrow();
    expect(() =>
      assertTarget(
        {
          ...target,
          name: "migration-review-prod",
          parent_id: "br-weathered-wave-au5ygpff",
        },
        host,
        url,
      ),
    ).not.toThrow();
  });

  test.each([
    { ...branch, project_id: "another-project" },
    { ...branch, name: "production" },
    { ...branch, id: "backup", name: "dev-before-prod-copy-20261101" },
    {
      ...branch,
      id: "copy",
      name: "cleanup-review-staging-test",
      parent_id: "untrusted",
    },
  ])("rejects an unapproved branch identity %p", (target) => {
    expect(() => assertTarget(target, host, url)).toThrow();
  });

  test.each([
    url.replace("/neondb", "/import"),
    `${url}&host=localhost`,
    `${url}&options=-csearch_path%3Dother`,
    url.replace("sslmode=require", "sslmode=disable"),
    url.replace(host, "localhost"),
    url.replace(host, `${host}:5433`),
    `${url}#ignored`,
  ])("rejects connection redirection or unsafe options", (candidate) => {
    expect(() => assertTarget(branch, host, candidate)).toThrow();
  });

  test("rejects pooling even if supplied as the expected host", () => {
    const pooled = host.replace(".c-", "-pooler.c-");
    expect(() =>
      assertTarget(branch, pooled, url.replace(host, pooled)),
    ).toThrow();
  });

  test("permits only the complete reviewed batch or an already-applied batch", () => {
    expect(pendingCleanup([], approved)).toEqual(approved);
    expect(pendingCleanup(approved, approved)).toEqual([]);
    expect(() => pendingCleanup([approved[0]], approved)).toThrow();
    expect(() =>
      pendingCleanup([], [...approved, "ClearUseEmbeddings1772100000000"]),
    ).toThrow();
    expect(() =>
      pendingCleanup([], [...approved, "SyncProdSchema1771000000000"]),
    ).toThrow();
  });

  test("preserves known legacy ledger duplicates but rejects new duplication", () => {
    const legacy = "init1709163288115";
    expect(pendingCleanup([legacy, legacy], [...approved, legacy])).toEqual(
      approved,
    );
    expect(() =>
      pendingCleanup([legacy, legacy, legacy], [...approved, legacy]),
    ).toThrow();
    expect(() =>
      pendingCleanup([approved[0], approved[0]], approved),
    ).toThrow();
  });
});
