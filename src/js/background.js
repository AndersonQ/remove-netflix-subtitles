function getCodeToInitSubtitlesManager() {
  // This code being returned is the compiled form of src/js/subtitle_manager.js
  // DO NOT CHANGE IT!! Instead, change src/js/subtitle_manager.js and paste its compiled form here
  return `
if (window.subtitlesManager === undefined) {
  window.subtitlesManager = function () {
    var subtitlesObserver = void 0;
    var subtitlesDiv = void 0;
    var subtitlesStatus = 'shown';

    return {
      status: function status() {
        return subtitlesStatus;
      },

      hide: function hide() {
        if (subtitlesObserver === undefined) {
          subtitlesObserver = new MutationObserver(function (mutations) {
            var _subtitlesDiv = mutations[0];
            _subtitlesDiv.target.style.visibility = 'hidden';
          });
        }

        if (subtitlesDiv === undefined) {
          subtitlesDiv = document.getElementsByClassName('player-timedtext')[0];
        }

        subtitlesObserver.observe(subtitlesDiv, {
          attributes: true,
          attributeFilter: ['style']
        });
        subtitlesStatus = 'hidden';
        chrome.runtime.sendMessage({ subtitlesStatus: subtitlesStatus });
      },

      show: function show() {
        if (subtitlesDiv) {
          subtitlesObserver.disconnect();
          subtitlesDiv = undefined;
          subtitlesStatus = 'shown';
          chrome.runtime.sendMessage({ subtitlesStatus: subtitlesStatus });
        }
      }
    };
  }();
}
`;
}

function getCodeToHideSubtitles() {
  return 'subtitlesManager.hide();';
}

function getCodeToShowSubtitles() {
  return 'subtitlesManager.show();';
}

function getCodeToToggleSubtitles() {
  return `
    switch(subtitlesManager.status()) {
      case 'hidden':
          ${getCodeToShowSubtitles()}
          break;
      case 'shown':
          ${getCodeToHideSubtitles()}
          break;
    }
  `;
}

function toggleSubtitles() {
  chrome.tabs.executeScript({
    code: getCodeToInitSubtitlesManager(),
  });

  chrome.tabs.executeScript({
    code: getCodeToToggleSubtitles(),
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const icon = request.subtitlesStatus === 'hidden' ? 'Red' : 'Green';

  chrome.pageAction.setIcon({
    path: `img/subtitle${icon}.png`,
    tabId: sender.tab.id,
  });
});

chrome.pageAction.onClicked.addListener((tab) => toggleSubtitles());

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'netflix',
              pathContains: 'watch',
            },
          }),
        ],

        actions: [new chrome.declarativeContent.ShowPageAction(),
                  // TODO: Inject subtitle_manager.js using RequestContentScript
                  // new chrome.declarativeContent.RequestContentScript({ js: ['js/subtitle_manager.js'] })
        ],
      },
    ]);
  });
});
