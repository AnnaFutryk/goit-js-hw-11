import { Notify } from 'notiflix/build/notiflix-notify-aio';
import PhotosService from "./js/PhotosService";
import LoadMoreBtn from "./js/LoadMoreBtn";
import axios from "axios";
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';


const modalLightboxGallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

const refs = {
    form: document.getElementById('search-form'),
    photosWrapper: document.querySelector('.gallery'),
}

const photosService = new PhotosService;
const loadMoreBtn = new LoadMoreBtn({
    selector: ".load-more",
    isHidden: true,
});

refs.form.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', fetchPhotos);

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
    const form = event.currentTarget;
    const value = form.elements.searchQuery.value.trim();

    if (value === "") {
        Notify.failure('No value!');
    return;
}
    else {
        photosService.searchQuery = value;
        photosService.resetPage();

        loadMoreBtn.show();
        clearPhotosList();

        fetchPhotos()
        .then(() => {
        const totalHits = photosService.totalPages;
        if(refs.photosWrapper.children.length > 0)Notify.success(`Hooray! We found ${totalHits} images.`);
      })
        .finally(() => form.reset());
    }
        
};

async function getPhotosMarkup() {
    try {
        const photos = await photosService.getPhotos()

        if (!photos) {
            loadMoreBtn.hide();
            return "";
        }

        if (photos.length === 0) throw new Error('No data');

        return photos.reduce(
            (markup, photo) => markup + createMarkup(photo),
            ''
        );
    } catch (err) {
        onError(err);
        return "";
    }
    


    // return photosService
    // .getPhotos()
    // .then((hits) => {
    //     if (hits.length === 0) throw new Error('No data');

    //     return hits.reduce(
    //         (markup, hit) => createMarkup(hit) + markup,
    //         ''
    //     );
    // })
    // .then(updatePhotosList)
    // .catch(onError)
}


async function fetchPhotos() {
    loadMoreBtn.disable();
    
    try {
        const markup = await getPhotosMarkup();
    
        if (!photosService.hasMorePhotos() && refs.photosWrapper.children.length > 0) {
            loadMoreBtn.hide();
            Notify.info("We're sorry, but you've reached the end of search results.");
        } else if (markup === "") {
            Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        } else {
            updatePhotosList(markup);
            modalLightboxGallery.refresh();
        }
        scrollPage();
    } catch (err) {
        onError(err)
    }
    
    loadMoreBtn.enable();

//   return getPhotosMarkup()
//     .then(() => {
//       if (!photosService.hasMorePhotos() && refs.photosWrapper.children.length !== 0) {
//         loadMoreBtn.end();
//         Notify.info("We're sorry, but you've reached the end of search results.");
//       } else {
//         loadMoreBtn.enable();
//       }
//     });
}

function createMarkup({tags, webformatURL, largeImageURL, likes, views, comments, downloads}) {
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
   
};

function updatePhotosList(markup) {
    refs.photosWrapper.insertAdjacentHTML("beforeend", markup);
};

function clearPhotosList() {
    refs.photosWrapper.innerHTML = '';
}

function onError(err) {
    console.log(err);
    loadMoreBtn.hide();
}

//infinity scroll
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5) {
       
        fetchPhotos();
    }
}

window.addEventListener('scroll', throttle(handleScroll, 500, { trailing: false }));