import { fetchImg } from './pixabay-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'notiflix/dist/notiflix-3.2.6.min.css';

const formEl = document.querySelector('.search-form');
const divEl = document.querySelector('.gallery');
const target = document.querySelector('.js-guard');
let currentPage = 1;
let inputEl;
let commonSumm = 0;
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoad, options);

async function onLoad(entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      try {
        currentPage += 1;
        const res = await fetchImg(inputEl, currentPage);
        commonSumm += res.data.hits.length;
        const totalHits = res.data.totalHits;
        if (commonSumm >= totalHits && commonSumm !== 0) {
          Notify.failure(
            "We're sorry, but you've reached the end of search results."
          );
          observer.unobserve(target);
        } else {
          divEl.insertAdjacentHTML('beforeend', createMarkup(res.data.hits));
          smoothPageScroll();
          lightbox;

          lightbox.refresh();
        }
      } catch (error) {
        Notify.failure(error.message);
      }
    }
  });
}

formEl.addEventListener('submit', onSubmitForm);

async function onSubmitForm(e) {
  e.preventDefault();
  clearGallery();
  currentPage = 1;
  commonSumm = 0;
  const formElements = e.currentTarget.elements;
  inputEl = formElements.searchQuery.value;
  if (inputEl !== '') {
    try {
      const res = await fetchImg(inputEl, currentPage);
      commonSumm += res.data.hits.length;
      divEl.insertAdjacentHTML('beforeend', createMarkup(res.data.hits));
      observer.observe(target);

      if (res.data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        smoothPageScroll();
        Notify.success(`Hooray! We found ${res.data.totalHits} images.`);
        lightbox;
        lightbox.refresh();
      }
    } catch (error) {
      Notify.failure(error.message);
    }
  } else {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
      <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <b>Likes ${likes}</b>
        </p>
        <p class="info-item">
          <b>Views ${views}</b>
        </p>
        <p class="info-item">
          <b>Comments ${comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads ${downloads}</b>
        </p>
      </div>
    </div>`
    )
    .join('');
}

function clearGallery() {
  divEl.innerHTML = '';
}

function smoothPageScroll() {
  const { height: cardHeight } = divEl.firstElementChild
    ? divEl.firstElementChild.getBoundingClientRect()
    : '';

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
