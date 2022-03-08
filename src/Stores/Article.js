import { Client } from '../Client.js';
import {
  initLanguageCodeObject,
  defaultLanguage
} from '../Utilities/LanguageCodes';
import { spinnerService } from '@simply007org/react-spinners';
import _ from 'lodash';

const resetStore = () => ({
  articleList: initLanguageCodeObject(),
  articleDetails: initLanguageCodeObject(),
  articleDetailsLinkedItems: initLanguageCodeObject()
});
let { articleList, articleDetails, articleDetailsLinkedItems } = resetStore();

let changeListeners = [];

let notifyChange = () => {
  changeListeners.forEach(listener => {
    listener();
  });
};

class Article {
  // Actions

  provideArticle(articleId, language) {
    let query = Client.items()
      .type('article')
      .equalsFilter('system.id', articleId)
      .elementsParameter([
        'title',
        'teaser_image',
        'post_date',
        'body_copy',
        'video_host',
        'video_id',
        'tweet_link',
        'theme',
        'display_options',
        'metadata__meta_title',
        'metadata__meta_description',
        'metadata__og_title',
        'metadata__og_description',
        'metadata__og_image',
        'metadata__twitter_title',
        'metadata__twitter_site',
        'metadata__twitter_creator',
        'metadata__twitter_description',
        'metadata__twitter_image'
      ]);

    if (language) {
      query.languageParameter(language);
    }

    if (spinnerService.isShowing('apiSpinner') === false) {
      spinnerService.show('apiSpinner');
    }

    query
      .toPromise()
      .then(response => {
        if (!response.isEmpty) {
          if (language) {
            articleDetails[language][articleId] = response.data.items[0];
            articleDetailsLinkedItems[language] = _.unionBy(articleDetailsLinkedItems[language], response.data.linkedItems, 'system.id');
          } else {
            articleDetails[defaultLanguage][articleId] = response.data.items[0];
            articleDetailsLinkedItems[defaultLanguage] = _.unionBy(articleDetailsLinkedItems[defaultLanguage], response.data.linkedItems, 'system.id');
          }
          notifyChange();
        }
      });
  }

  provideArticles(language) {
    let query = Client.items()
      .type('article')
      .orderByDescending('elements.post_date');

    if (language) {
      query.languageParameter(language);
    }

    if (spinnerService.isShowing('apiSpinner') === false) {
      spinnerService.show('apiSpinner');
    }

    query
      .toPromise()
      .then(response => {
        if (language) {
          articleList[language] = response.data.items;
        } else {
          articleList[defaultLanguage] = response.data.items;
        }
        notifyChange();
      });
  }

  // Methods
  getArticle(articleId, language) {
    spinnerService.hide('apiSpinner');
    if (language) {
      return articleDetails[language][articleId];
    } else {
      return articleDetails[defaultLanguage][articleId];
    }
  }

  getArticleLinkedItems(language) {
    spinnerService.hide('apiSpinner');
    if (language) {
      return articleDetailsLinkedItems[language];
    } else {
      return articleDetailsLinkedItems[defaultLanguage];
    }
  }

  getArticles(count, language) {
    spinnerService.hide('apiSpinner');
    if (language) {
      return articleList[language].slice(0, count);
    } else {
      return articleList[defaultLanguage].slice(0, count);
    }
  }

  // Listeners
  addChangeListener(listener) {
    changeListeners.push(listener);
  }

  removeChangeListener(listener) {
    changeListeners = changeListeners.filter(element => {
      return element !== listener;
    });
  }
}

let ArticleStore = new Article();

export { ArticleStore, resetStore };
