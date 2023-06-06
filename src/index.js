import { Notify } from 'notiflix/build/notiflix-notify-aio';
import PhotosService from './js/PhotosService';
import LoadMoreBtn from './js/LoadMoreBtn';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

const modalLightboxGallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

const refs = {
  form: document.getElementById('search-form'),
  photosWrapper: document.querySelector('.gallery'),
};

const photosService = new PhotosService();

const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  isHidden: true,
});

refs.form.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', onLoadMoreBtnClick);

//  smooth scrolling
function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onSubmit(event) {
  event.preventDefault();
  clearPhotosList();
  loadMoreBtn.hide();
  const form = event.currentTarget;
  const value = form.elements.searchQuery.value.trim();
  photosService.q = value;

  if (value === '') {
    Notify.failure('No value!');
    return;
  }

  if (!value) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  photosService.resetPage();
  form.reset();
  getPhotosMarkup();
}

async function getPhotosMarkup() {
  try {
    const { data } = await photosService.getPhotos();

    if (data.totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    data.hits.forEach(imageData => {
      const markup = createMarkup(imageData);
      updatePhotosList(markup);
      scrollPage();
    });

    Notify.success(`Hooray! We found ${data.totalHits} images.`);

    modalLightboxGallery.refresh();

    if (data.totalHits > photosService.per_page) {
      loadMoreBtn.show();
    }
  } catch (error) {
    console.log(error);
  }
}

function onLoadMoreBtnClick() {
  photosService.incrementPage();
  fetchMorePhotos();
}

async function fetchMorePhotos() {
  loadMoreBtn.disable();
  try {
    const { data } = await photosService.getPhotos();

    data.hits.forEach(imageData => {
      const markup = createMarkup(imageData);
      updatePhotosList(markup);
      scrollPage();
    });

    loadMoreBtn.enable();
    modalLightboxGallery.refresh();

    if (photosService.page >= data.totalHits / photosService.per_page) {
      loadMoreBtn.hide();
      Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    console.log(error);
  }
}

function createMarkup({
  tags,
  webformatURL,
  largeImageURL,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
    <a href="${largeImageURL}" class="card-link js-card-link">
    <div class="photo-card">
        <img class="photo" src="${webformatURL}" alt="${tags}"  width = "300" height="200" loading="lazy" />
        <div class="info">
            <p class="info-item">
                <b>Likes</b>
                ${likes}
            </p>
            <p class="info-item">
                <b>Views</b>
                ${views}
            </p>
            <p class="info-item">
                <b>Comments</b>
                ${comments}
            </p>
            <p class="info-item">
                <b>Downloads</b>
                ${downloads}
            </p>
        </div>
    </div>
    </a>`;
}

function updatePhotosList(markup) {
  refs.photosWrapper.insertAdjacentHTML('beforeend', markup);
}

function clearPhotosList() {
  refs.photosWrapper.innerHTML = '';
}

// //infinity scroll
// function handleScroll() {
//   const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

//   if (scrollTop + clientHeight >= scrollHeight - clientHeight) {
//     photosService.incrementPage();
//     fetchMorePhotos();
//   }
// }

// window.addEventListener(
//   'scroll',
//   throttle(handleScroll, 500, { trailing: false })
// );
