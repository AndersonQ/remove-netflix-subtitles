if (window.subtitlesManager === undefined) {
  window.subtitlesManager = (() => {
    let subtitlesObserver;
    let subtitlesDiv;
    let subtitlesStatus = 'shown';

    return {
      status: () => subtitlesStatus,

      hide: () => {
        if (subtitlesObserver === undefined) {
          subtitlesObserver = new MutationObserver((mutations) => {
            const _subtitlesDiv = mutations[0];
            _subtitlesDiv.target.style.visibility = 'hidden';
          });
        }

        if (subtitlesDiv === undefined) {
          subtitlesDiv = document.getElementsByClassName('player-timedtext')[0];
        }

        subtitlesObserver.observe(subtitlesDiv, {
          attributes: true,
          attributeFilter: ['style'],
        });
        subtitlesStatus = 'hidden';
        chrome.runtime.sendMessage({ subtitlesStatus });
      },

      show: () => {
        if (subtitlesDiv) {
          subtitlesObserver.disconnect();
          subtitlesDiv = undefined;
          subtitlesStatus = 'shown';
          chrome.runtime.sendMessage({ subtitlesStatus });
        }
      },
    };
  })();
}
