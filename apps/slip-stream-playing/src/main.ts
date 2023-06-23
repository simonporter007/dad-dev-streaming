let playerRoot = document.querySelector(
  '[class*="GlobalPlayerContainerStyles_root"]'
);
const root = document.querySelector('#__next');

const rootObserver = new MutationObserver((mutationRecords) => {
  const startedPlaying = mutationRecords.some(
    (mutation) =>
      mutation?.addedNodes?.length &&
      (Array.from(mutation?.addedNodes) as HTMLElement[])?.some((node) =>
        node.classList.value.includes('GlobalPlayerContainerStyles_root')
      )
  );
  if (!playerRoot && startedPlaying) {
    playerRoot = document.querySelector(
      '[class*="GlobalPlayerContainerStyles_root"]'
    );
    playerRoot &&
      playerObserver.observe(playerRoot, {
        childList: true, // observe direct children
        subtree: true, // and lower descendants too
        characterDataOldValue: true, // pass old data to callback
      });
  }
});

const playerObserver = new MutationObserver((mutationRecords) => {
  rootObserver.disconnect();
  const changedTracks = mutationRecords.some(
    (mutation) => (mutation?.target as HTMLElement).tagName === 'WAVE'
  );
  if (changedTracks) {
    const playerDetails = document.querySelector(
      '[class*="PlayerDetailsStyles_withCover"]'
    );
    const title = (playerDetails?.lastChild as HTMLElement)?.querySelector(
      'a > p'
    )?.textContent;
    const artist = (playerDetails?.lastChild as HTMLElement)?.querySelector(
      'span'
    )?.textContent;
    if (title && artist) {
      fetch('https://slip-stream-currently-playing.vercel.app/api/slipstream', {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          artist,
          title,
        }),
      });
    }
  }
});

if (!playerRoot && root) {
  rootObserver.observe(root, {
    childList: true, // observe direct children
    subtree: true, // and lower descendants too
    characterDataOldValue: true, // pass old data to callback
  });
} else if (playerRoot) {
  playerObserver.observe(playerRoot, {
    childList: true, // observe direct children
    subtree: true, // and lower descendants too
    characterDataOldValue: true, // pass old data to callback
  });
}
