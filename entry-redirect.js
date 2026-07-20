(() => {
  const entrySeenKey = "nexora.prototypeEntrySeen.v1";

  try {
    if (window.localStorage.getItem(entrySeenKey) === "true") return;

    window.localStorage.setItem(entrySeenKey, "true");
    window.location.replace("/prototype-work");
  } catch {
    // Keep Home accessible when browser storage is unavailable.
  }
})();
