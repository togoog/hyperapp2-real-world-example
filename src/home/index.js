import { html } from "../shared/html.js";
import cc from "../web_modules/classcat.js";
import { Http } from "../web_modules/@kwasniew/hyperapp-fx.js";
import { preventDefault } from "../shared/lib/events.js";
import { API_ROOT } from "../config.js";
import { pages } from "../shared/selectors.js";
import { LogError } from "../shared/errors.js";
import {
  ArticleList,
  FetchArticles,
  loadingArticles,
  USER_FEED,
  GLOBAL_FEED,
  TAG_FEED
} from "../shared/articles/index.js";

const SetTags = (state, { tags }) => ({ ...state, tags });

export const FetchTags = Http({
  url: API_ROOT + "/tags",
  action: SetTags,
  error: LogError
});

export const ChangeTab = (state, { activeFeedName, activeFeedType }) => {
  const feeds = [
    state.user.token ? USER_FEED : null,
    GLOBAL_FEED,
    activeFeedType === TAG_FEED ? TAG_FEED : null
  ].filter(x => x);
  const newState = {
    ...state,
    activeFeedType,
    activeFeedName,
    feeds,
    tag: name,
    ...loadingArticles
  };
  return [newState, [preventDefault, FetchArticles(newState)]];
};

export const LoadHomePage = page => state => {
  const feeds = state.user.token ? [USER_FEED, GLOBAL_FEED] : [GLOBAL_FEED];
  const activeFeedType = state.user.token ? USER_FEED : GLOBAL_FEED;
  const activeFeedName = activeFeedType;
  const newState = {
    user: state.user,
    page,
    activeFeedName,
    activeFeedType,
    feeds,
    tags: [],
    ...loadingArticles
  };
  return [newState, [FetchArticles(newState), FetchTags]];
};

const Banner = () =>
  html`
    <div class="banner">
      <div class="container">
        <h1 class="logo-font">conduit</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>
  `;

const FeedTab = ({ active, type, name }, children) =>
  html`
    <li class="nav-item">
      <a
        href=""
        class=${cc({ "nav-link": true, active })}
        onclick=${[ChangeTab, { activeFeedName: name, activeFeedType: type }]}
      >
        ${children}
      </a>
    </li>
  `;
const Tags = ({ tags }) => html`
  <div class="tag-list">
    ${tags.map(tag => {
      return html`
        <a
          href=""
          class="tag-pill tag-default"
          onclick=${[ChangeTab, { activeFeedType: TAG_FEED, activeFeedName: tag }]}
        >
          ${tag}
        </a>
      `;
    })}
  </div>
`;

export const HomePage = ({
  user,
  articles,
  articlesCount,
  currentPageIndex,
  isLoading,
  tags,
  feeds,
  activeFeedName,
  activeFeedType
}) =>
  html`
    <div class="home-page" key="home-page">
      ${user ? "" : Banner()}

      <div class="container page">
        <div class="row">
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                ${feeds[0]
                  ? FeedTab({ active: activeFeedType === USER_FEED, type: USER_FEED, name: activeFeedType }, "Your Feed")
                  : ""}
                ${feeds[1]
                  ? FeedTab({ active: activeFeedType === GLOBAL_FEED, type: GLOBAL_FEED, name: activeFeedType }, "Global Feed")
                  : ""}
                ${feeds[2]
                  ? FeedTab(
                      { active: activeFeedType === TAG_FEED, type: TAG_FEED, name: activeFeedName },
                      html`
                        <i class="ion-pound" /> ${activeFeedName}
                      `
                    )
                  : ""}
              </ul>
            </div>
            ${ArticleList({
              articles,
              isLoading,
              pages: pages({ count: articlesCount, currentPageIndex })
            })}
          </div>

          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>

              ${Tags({ tags })}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
