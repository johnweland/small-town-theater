export function isE2ETestMode() {
  return (
    process.env.E2E_TEST_MODE === "1" ||
    process.env.NEXT_PUBLIC_E2E_TEST_MODE === "1"
  );
}
