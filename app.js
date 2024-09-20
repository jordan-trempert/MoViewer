// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, sendEmailVerification  } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import {getFirestore, collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';


// Firebase config and initialization
const firebaseConfig = {
    apiKey: "AIzaSyAVDIP1W89kLM7xgJo8yAvTufP0fcbg9fk",
    authDomain: "moviewer-84e0d.firebaseapp.com",
    projectId: "moviewer-84e0d",
    storageBucket: "moviewer-84e0d.appspot.com",
    messagingSenderId: "752291823648",
    appId: "1:752291823648:web:f396025ae5dfeca950fc45",
    measurementId: "G-W6PLPV0N1L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper function to toggle visibility
function toggleVisibility(user) {
    const usernameElement = document.getElementById('user-username');
    const logoutButton = document.getElementById('logout');
    const authForm = document.getElementById('auth-form');
    const loginForm = document.getElementById('login-form');
    const searchForm = document.getElementById('search-form');

    if (user && usernameElement != null) {
        // If user is logged in
        usernameElement.textContent = user.displayName || user.email;
        usernameElement.style.display = 'block';
        logoutButton.style.display = 'block';
        authForm.style.display = 'none';
        loginForm.style.display = 'none';
        searchForm.style.display = 'block';
    } else {
        // If user is logged out
        if(usernameElement){
            usernameElement.style.display = 'none';
            logoutButton.style.display = 'none';
            authForm.style.display = 'block';
            loginForm.style.display = 'none';
            searchForm.style.display = 'none';
        }

    }
}

// Toggle between login and sign-up forms
if(document.getElementById('email-login-toggle')){

    document.getElementById('email-login-toggle').addEventListener('click', () => {
        document.getElementById('auth-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    document.getElementById('signup-toggle').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('auth-form').style.display = 'block';
    });

    // Sign-up event listener
    document.getElementById('email-signup').addEventListener('click', () => {
        const email = document.getElementById('email-input').value;
        const password = document.getElementById('password-input').value;
        const username = document.getElementById('username-input').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Update profile to include the custom username
                updateProfile(user, {
                    displayName: username
                }).then(() => {
                    console.log('Username set:', user.displayName);
                    toggleVisibility(user);
                }).catch((error) => {
                    console.error('Error setting username:', error);
                });
            })
            .catch((error) => {
                console.error('Sign-up failed:', error);
            });
    });

    // Login event listener
    document.getElementById('email-login').addEventListener('click', () => {
        const email = document.getElementById('login-email-input').value;
        const password = document.getElementById('login-password-input').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                toggleVisibility(user);
            })
            .catch((error) => {
                console.error('Login failed:', error);
            });
    });

    // Logout event listener
    document.getElementById('logout').addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log('User logged out');
            toggleVisibility(null);
        }).catch((error) => {
            console.error('Logout failed:', error);
        });
    });
}
// Check if the user is logged in on page load
onAuthStateChanged(auth, (user) => {
    toggleVisibility(user);
});


document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const imdbID = params.get('imdbID');
    const commentsContainer = document.getElementById('comments-container');
    const body = document.getElementById('body');
    const header = document.getElementById('header');
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const containerBG = document.getElementById('color');
    const colorThief = new ColorThief();

    if (imdbID && commentForm) {
        // Fetch movie details from OMDb API
        const apiKey = '97910366'; // Replace with your OMDb API key
        const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;
        let movieTitle = '';
        let moviePoster = '';

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.Response === 'True') {
                movieTitle = data.Title;
                moviePoster = data.Poster;
                header.innerText = `${movieTitle} Comments`; // Update header text

                const img = new Image();
                img.crossOrigin = 'Anonymous'; // Ensure CORS is handled
                img.crossOrigin = 'Anonymous'; // Ensure CORS is handled
                img.src = moviePoster;

                img.onload = () => {
                    const [r, g, b] = colorThief.getColor(img);
                    const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.7)`; // Convert RGB to RGBA with alpha 0.7
                    containerBG.style.backgroundColor = rgbaColor;

                    // Calculate the opposite color for the text
                    const oppositeColor = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
                    header.style.color = `rgb(255,255,255)`; // Set the header color to the opposite

                    // Add a black outline to the text with 2px thickness
                    header.style.textShadow = `
                        -1px -1px 0px black,
                         1px -1px 0px black,
                        -1px  1px 0px black,
                         1px  1px 0px black
                    `;

                    // Optionally, you can get the color palette as well
                    const palette = colorThief.getPalette(img, 5);
                    console.log('Palette:', palette);
                };

                // Set the blurred background
                body.style.position = 'relative';
                body.style.background = `url(${moviePoster}) no-repeat center center fixed`;
                body.style.backgroundSize = 'cover';

                // Create and style the blurred background element
                const blurredBackground = document.createElement('div');
                blurredBackground.className = 'blurred-background';
                blurredBackground.style.backgroundImage = `url(${moviePoster})`;
                body.appendChild(blurredBackground);
            } else {
                console.error('Error fetching movie details:', data.Error);
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }

        // Load existing comments
        const commentsQuery = query(
            collection(db, 'comments'),
            where('imdbID', '==', imdbID),
            orderBy('timestamp', 'desc')
        );

        try {
            const querySnapshot = await getDocs(commentsQuery);
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `<p><strong>${data.displayName || 'Unknown User'}</strong>: ${data.comment} <br /><em>${new Date(data.timestamp.toDate()).toLocaleString()}</em></p>`;
                commentsContainer.appendChild(commentElement);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }

        // Add new comment
        commentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const user = auth.currentUser;

            if (user && commentInput.value.trim()) {
                try {
                    await addDoc(collection(db, 'comments'), {
                        imdbID: imdbID,
                        userId: user.uid,
                        displayName: user.displayName || 'Anonymous', // Store displayName
                        comment: commentInput.value,
                        timestamp: new Date()
                    });
                    // Clear input and reload comments
                    commentInput.value = '';
                    commentsContainer.innerHTML = '';
                    // Reload comments with updated query
                    const updatedCommentsQuery = query(
                        collection(db, 'comments'),
                        where('imdbID', '==', imdbID),
                        orderBy('timestamp', 'desc')
                    );
                    const updatedQuerySnapshot = await getDocs(updatedCommentsQuery);
                    for (const doc of updatedQuerySnapshot.docs) {
                        const data = doc.data();
                        const commentElement = document.createElement('div');
                        commentElement.className = 'comment';
                        commentElement.innerHTML = `<p><strong>${data.displayName || 'Unknown User'}</strong>: ${data.comment} <br /><em>${new Date(data.timestamp.toDate()).toLocaleString()}</em></p>`;
                        commentsContainer.appendChild(commentElement);
                    }
                } catch (error) {
                    console.error('Error adding comment:', error);
                }
            } else {
                alert('You must be logged in to comment and the comment cannot be empty.');
            }
        });
    } else {
        console.error('No imdbID provided.');
    }
});




// Check if the user is logged in on page load
onAuthStateChanged(auth, (user) => {
    if(document.getElementById('movie-list')){
        if (user) {
            console.log('User is logged in:', user.email);
            document.getElementById('movie-list').style.display = 'block'; // Show content if user is logged in
            // Hide login button and show logout button and username
            //document.getElementById('google-login').style.display = 'none';
            document.getElementById('logout').style.display = 'block';
            document.getElementById('user-username').textContent = user.displayName || user.email;
            document.getElementById('user-username').style.display = 'block';
        } else {
            console.log('No user logged in');
            document.getElementById('movie-list').style.display = 'none'; // Hide content if no user is logged in
            // Show login button and hide logout button and username
            //document.getElementById('google-login').style.display = 'block';
            document.getElementById('logout').style.display = 'none';
            document.getElementById('user-username').style.display = 'none';
        }
    }
});


if(document.getElementById('search-form')){
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const query = document.getElementById('search-input').value.trim();
        if (query) {
            searchMovies(query);
        } else {
            alert('Please enter a movie title.');
        }
    });



    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const query = document.getElementById('search-input').value.trim();
        if (query) {
            searchMovies(query);
        } else {
            alert('Please enter a movie title.');
        }
    });
}



document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '97910366'; // Replace with your OMDb API key
    const searchForm = document.getElementById('search-form');
    const ratingButton = document.getElementById('submit-rating');
    const searchInput = document.getElementById('search-input');
    const viewRatedMoviesButton = document.getElementById('view-rated-movies');
    const submitRatingButton = document.getElementById('submit-rating');
    const commentsButton = document.getElementById('comments-button');
    const movieList = document.getElementById('movie-list');
    const movieDetails = document.getElementById('movie-details');
    const ratedMoviesSection = document.getElementById('rated-movies');
    const container = document.querySelector('.container');
    const sortDropdown = document.getElementById('sort-movies');






    const sortSelect = document.getElementById('sort-movies');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                const sortBy = this.value;
                sortMovies(sortBy);
            });
        }

    function resetSite() {
            searchInput.value = ''; // Clear the search input
            movieList.innerHTML = ''; // Clear the search results list
            movieDetails.style.display = 'none'; // Hide the movie details section
            container.style.backgroundColor = ''; // Reset background color
            container.querySelectorAll('.detail-box').forEach(box => box.style.backgroundColor = ''); // Reset container color
            document.body.style.setProperty('--bg-image', 'none');
            document.body.classList.remove('show-bg');
            resetMovieDetails();

            const button = document.querySelector('button');
            const button2 = document.getElementById('view-rated-movies');

                button.style.backgroundColor = '#007BFF'; // Reset to the original color
                button2.style.backgroundColor = '#007BFF'; // Reset to the original color

                button.addEventListener('mouseover', () => {
                    button.style.backgroundColor = adjust('#007BFF', -50); // Change to your desired color
                });

                button2.addEventListener('mouseover', () => {
                    button2.style.backgroundColor = adjust('#007BFF', -50); // Change to your desired color
                });

                button.addEventListener('mouseout', () => {
                    button.style.backgroundColor = '#007BFF'; // Reset to the original color
                });

                button2.addEventListener('mouseout', () => {
                    button2.style.backgroundColor = '#007BFF'; // Reset to the original color
                });
        }


    if(searchForm){
        searchForm.addEventListener('submit', (event) => {
                event.preventDefault();
                // Hide rated movies section
                ratedMoviesSection.style.display = 'none';

            });
    }

    // Handle rating submission
    if (ratingButton) {
        ratingButton.addEventListener('click', async function() {
            const selectedRating = document.querySelector('input[name="rating"]:checked');
            const moviePoster = document.getElementById('movie-poster');
            const imdbID = moviePoster ? moviePoster.alt : null;

            console.log('IMDb ID:', imdbID);
            console.log('Selected Rating:', selectedRating ? selectedRating.value : 'None');

            const user = auth.currentUser;
            console.log('Current user:', user);

            if (user && imdbID) {
                if (selectedRating) {
                    const rating = parseFloat(selectedRating.value);
                    const userId = user.uid;

                    // Check if a rating from this user for this movie already exists
                    const ratingQuery = query(
                        collection(db, 'ratings'),
                        where('userId', '==', userId),
                        where('imdbID', '==', imdbID)
                    );

                    try {
                        const querySnapshot = await getDocs(ratingQuery);

                        if (!querySnapshot.empty) {
                            // Update existing rating
                            const docId = querySnapshot.docs[0].id;
                            await updateDoc(doc(db, 'ratings', docId), {
                                rating: rating,
                                timestamp: new Date() // Optionally update timestamp
                            });
                            document.getElementById('rating-response').innerText = `Rating for "${querySnapshot.docs[0].data().title}" updated to ${rating}/5!`;
                        } else {
                            // Add new rating
                            const movieResponse = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
                            const movieData = await movieResponse.json();

                            if (movieData.Response === 'True') {
                                const ratedMovie = {
                                    userId: userId,
                                    title: movieData.Title,
                                    poster: movieData.Poster,
                                    rating: rating,
                                    imdbID: imdbID,
                                    timestamp: new Date()
                                };

                                try {
                                    await addDoc(collection(db, 'ratings'), ratedMovie);
                                    document.getElementById('rating-response').innerText = `Thank you for rating "${movieData.Title}" ${rating}/5!`;
                                } catch (error) {
                                    console.error('Error saving rating:', error);
                                    document.getElementById('rating-response').innerText = 'Error saving rating.';
                                }
                            } else {
                                document.getElementById('rating-response').innerText = 'Movie not found.';
                            }
                        }
                    } catch (error) {
                        console.error('Error querying or updating rating:', error);
                        document.getElementById('rating-response').innerText = 'Error processing rating.';
                    }
                } else {
                    document.getElementById('rating-response').innerText = 'Please select a rating.';
                }
            } else {
                document.getElementById('rating-response').innerText = user ? 'No movie selected.' : 'You need to login to rate movies.';
            }
        });
    }

if (commentsButton) {
    commentsButton.addEventListener('click', async function() {
        const moviePoster = document.getElementById('movie-poster');
        const imdbID = moviePoster ? moviePoster.alt : null;

        if (imdbID) {
            document.location.href = `comments.html?imdbID=${imdbID}`;
        } else {
            console.error('IMDb ID not found.');
        }
    });
}







    // Function to create a promise that resolves when an image is loaded
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Handle cross-origin issues
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

// Fetch rated movies from Firestore and display the user's ratings
if (viewRatedMoviesButton) {
    viewRatedMoviesButton.addEventListener('click', async function () {
        resetMovieDetails();
        resetSite();

        ratedMoviesSection.style.display = 'block';
        const ratedMovies = [];

        // Get the current authenticated user
        const user = auth.currentUser;

        if (user) {
            try {
                // Query Firestore to get ratings for the logged-in user
                const q = query(collection(db, 'ratings'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                // Collect user's ratings
                querySnapshot.forEach((doc) => {
                    ratedMovies.push(doc.data());
                });

                // Display rated movies with the user's rating
                const ratedMovieContainer = document.getElementById('rated-movie-container');
                if (!ratedMovieContainer) {
                    console.error('Element with ID "rated-movie-container" not found');
                    return;
                }
                ratedMovieContainer.innerHTML = ''; // Clear previous content

                // Fetch movie details for each rated movie
                for (const movie of ratedMovies) {
                    const response = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`);
                    const details = await response.json();

                    const movieDiv = document.createElement('div');
                    movieDiv.className = 'rated-movie';
                    movieDiv.style.background = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${details.Poster})`;

                    movieDiv.innerHTML = `
                        <div class="content">
                            <img src="${details.Poster}" alt="${details.Title}" class="movie-poster" data-id="${movie.imdbID}">
                            <div class="text-container" style="color: #ffffff;">
                                <strong>${details.Title}</strong>
                                <p>Your Rating: ${movie.rating}/5</p>
                            </div>
                        </div>
                    `;
                    ratedMovieContainer.appendChild(movieDiv);
                }

                // Add click event listener to each movie poster
                document.querySelectorAll('.movie-poster').forEach((poster) => {
                    poster.addEventListener('click', function () {
                        const imdbID = this.getAttribute('data-id');
                        showMovieDetails(imdbID);
                    });
                });

                ratedMoviesSection.style.display = ratedMovies.length > 0 ? 'block' : 'none';
            } catch (error) {
                console.error('Error fetching ratings:', error);
                document.getElementById('rated-movie-container').innerHTML = '<p>Error fetching movie details.</p>';
                ratedMoviesSection.style.display = 'none';
            }
        } else {
            console.log('No user logged in.');
            ratedMoviesSection.style.display = 'none';
        }
    });
}











    // Define the function to show movie details
    async function showMovieDetails(imdbID) {
        window.scrollTo(0, 0);
        resetRatingStars(); // Reset stars before showing new movie
        fetchMovieDetails(imdbID); // Fetch and display movie details
        ratedMoviesSection.style.display = 'none';

        try {
            // Query Firestore to get all ratings for the selected movie
            const q = query(collection(db, 'ratings'), where('imdbID', '==', imdbID));
            const querySnapshot = await getDocs(q);

            const ratings = [];
            querySnapshot.forEach((doc) => {
                ratings.push(Number(doc.data().rating)); // Ensure ratings are numbers
            });

            // Calculate the average rating
            const averageRating = ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : 'N/A';

            // Display the average rating on the movie details page
            const averageRatingElement = document.getElementById('average-rating');
            averageRatingElement.innerText = `Average Rating: ${averageRating}/5`;

        } catch (error) {
            console.error('Error fetching average rating:', error);
            document.getElementById('average-rating').innerText = 'Error fetching average rating';
        }
    }

function sortMovies(criteria) {
    const movieList = document.getElementById('rated-movie-container');
    if (!movieList) return;

    // Get current list items
    let movies = Array.from(movieList.querySelectorAll('.rated-movie'));

    // Sort based on the criteria
    movies.sort((a, b) => {
        const imdbID_A = a.querySelector('img').getAttribute('data-id');
        const imdbID_B = b.querySelector('img').getAttribute('data-id');

        if (criteria === 'name') {
            const titleA = a.querySelector('.text-container strong').innerText;
            const titleB = b.querySelector('.text-container strong').innerText;
            return titleA.localeCompare(titleB);
        } else if (criteria === 'rating') {
            const dataA = localStorage.getItem(imdbID_A);
            const dataB = localStorage.getItem(imdbID_B);

            // Default to 0 if no rating is found
            const ratingA = dataA ? JSON.parse(dataA).rating : 0;
            const ratingB = dataB ? JSON.parse(dataB).rating : 0;

            console.log(ratingA);
            console.log(ratingB);
            return ratingB - ratingA; // Sort descending by rating
        }
        return 0;
    });

    // Update movie list with sorted items
    movieList.innerHTML = '';
    movies.forEach(movie => movieList.appendChild(movie));
}




});



function searchMovies(query) {


    const apiKey = '97910366'; // Replace with your OMDb API key
    const url = `https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`;

    // Reset movie details and show search results
    document.getElementById('movie-details').style.display = 'none';
    document.getElementById('movie-list').style.display = 'flex';
    document.body.classList.remove('show-bg'); // Remove background blur
    document.querySelector('.container').style.background = 'rgba(255,255,255, 0.4)';
    //document.querySelector('.container').style.backgroundColor = 'rgba(255,255,255, 0.7)';

    

    const button = document.querySelector('button');
    const button2 = document.getElementById('view-rated-movies');
    button.style.backgroundColor = '#007BFF'; // Reset to the original color

    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = adjust('#007BFF', -50); // Change to your desired color
    });

    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#007BFF'; // Reset to the original color
    });


    button2.addEventListener('mouseover', () => {
        button2.style.backgroundColor = adjust('#007BFF', -50); // Change to your desired color
    });

    button2.addEventListener('mouseout', () => {
        button2.style.backgroundColor = '#007BFF'; // Reset to the original color
    });

    document.querySelector('h1').style.color = 'black';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'False') {
                document.getElementById('movie-list').innerHTML = `<p>${data.Error}</p>`;
            } else {
                const movies = data.Search;
                if (movies) {
                    let output = '';
                    movies.forEach(movie => {
                        output += `
                            <li data-id="${movie.imdbID}">
                                <img src="${movie.Poster}" alt="${movie.Title} Poster">
                            </li>
                        `;
                    });
                    document.getElementById('movie-list').innerHTML = output;

                    // Remove existing event listeners
                    document.querySelectorAll('#movie-list li').forEach(item => {
                        item.removeEventListener('click', handleMovieClick);
                    });

                    // Add new click event listener to movie items
                    document.querySelectorAll('#movie-list li').forEach(item => {
                        item.addEventListener('click', handleMovieClick);
                    });
                } else {
                    document.getElementById('movie-list').innerHTML = '<p>No movies found.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('movie-list').innerHTML = '<p>Failed to fetch movies.</p>';
        });
}

function handleMovieClick() {
    window.scrollTo(0,0);
    const imdbID = this.getAttribute('data-id');
    fetchMovieDetails(imdbID);
}

function fetchMovieTitle(imdbID) {
    const apiKey = '97910366'; // Replace with your OMDb API key
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'False') {
                document.getElementById('movie-details').innerHTML = `<p>${data.Error}</p>`;
                document.getElementById('movie-details').style.display = 'none';
                document.getElementById('movie-list').style.display = 'flex'; // Show the list again
                resetMovieDetails(); // Reset details before showing new data
                document.body.classList.remove('show-bg'); // Remove background blur
                return null; // Return null if there's an error
            } else {
                return data.Title;

            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            return null; // Return null in case of an error
        });
}


// Function to reset the rating stars
function resetRatingStars() {
    const ratingButtons = document.querySelectorAll('input[name="rating"]');
    ratingButtons.forEach(button => {
        button.checked = false;
    });
}

// Modify the function that shows movie details to reset stars
function showMovieDetails(imdbID) {
    window.scrollTo(0,0);
    resetRatingStars(); // Reset stars before showing new movie
    fetchMovieDetails(imdbID); // Fetch and display movie details
    ratedMoviesSection.style.display = 'none';
}


function setRatingFromLocalStorage(imdbID) {
    const rating = localStorage.getItem(imdbID);

    if (rating) {
        const parsedRating = JSON.parse(rating).rating; // Parse and get the rating
        const radioInput = document.querySelector(`input[name="rating"][value="${parsedRating}"]`);

        if (radioInput) {
            radioInput.checked = true; // Set the appropriate radio button as checked
        }
    }
}

// Function to fetch and display movie details with average rating
async function fetchMovieDetails(imdbID) {
    const apiKey = '97910366'; // Replace with your OMDb API key
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;

    try {
        // Fetch movie details from OMDb API
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === 'False') {
            document.getElementById('movie-details').innerHTML = `<p>${data.Error}</p>`;
            document.getElementById('movie-details').style.display = 'none';
            document.getElementById('movie-list').style.display = 'flex';
            resetMovieDetails();
            document.body.classList.remove('show-bg');
            return;
        }

        resetMovieDetails();
        resetRatingStars(); // Reset stars when fetching new details

        // Populate movie details
        document.getElementById('movie-title').innerText = data.Title;
        document.getElementById('movie-year').innerText = data.Year;
        document.getElementById('movie-rated').innerText = data.Rated;
        document.getElementById('movie-runtime').innerText = data.Runtime;
        document.getElementById('movie-genre').innerText = data.Genre;
        document.getElementById('movie-director').innerText = `Directed by: ${data.Director}`;
        document.getElementById('movie-writer').innerText = `Written by: ${data.Writer}`;
        document.getElementById('movie-actors').innerText = `Actors: ${data.Actors}`;
        document.getElementById('movie-plot').innerText = data.Plot;
        document.getElementById('movie-language').innerText = data.Language;
        document.getElementById('movie-country').innerText = data.Country;
        document.getElementById('movie-awards').innerText = `Awards: ${data.Awards}`;
        document.getElementById('movie-boxoffice').innerText = `Grossed ${data.BoxOffice}`;
        document.getElementById('movie-poster').src = data.Poster;
        document.getElementById('movie-poster').alt = imdbID; // Set IMDb ID as alt attribute

        document.body.style.setProperty('--bg-image', `url(${data.Poster})`);
        document.body.classList.add('show-bg');
        setRatingFromLocalStorage(imdbID);

        // Fetch and display the average rating for the movie
        await displayAverageRating(imdbID);

        document.getElementById('movie-details').style.display = 'block';
        document.getElementById('movie-list').style.display = 'none';

        const colorThief = new ColorThief();


        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Ensure CORS is handled
        img.src = data.Poster;
        const detailBox = document.getElementsByClassName('detail-box');
        const container = document.getElementsByClassName('container');
        const username = document.getElementsByClassName('username');


        img.onload = () => {
            const [r, g, b] = colorThief.getColor(img);
            const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.4)`; // Convert RGB to RGBA with alpha 0.7

            // Calculate luminance for contrast ratio
            const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            const textColor = luminance > 0.5 ? 'black' : 'white'; // Choose black or white based on luminance

            // Function to darken color
            const darkenColor = (r, g, b, factor = 0.1) => { // Reduced factor to make it less dark
                const newR = Math.max(0, r - factor * 255);
                const newG = Math.max(0, g - factor * 255);
                const newB = Math.max(0, b - factor * 255);
                return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`;
            };

            const darkenedButtonColor = darkenColor(r, g, b, 0.1); // Slightly darker
            const darkenedButtonHoverColor = darkenColor(r, g, b, 0.2); // Even darker for hover

            // Apply background color to all elements with the class 'detail-box'
            Array.from(detailBox).forEach(box => {
                box.style.backgroundColor = rgbaColor;
            });

            Array.from(username).forEach(name => {
                name.style.backgroundColor = rgbaColor;
            });

            // Apply background color to all elements with the class 'container'
            Array.from(container).forEach(cont => {
                cont.style.backgroundColor = rgbaColor;
            });

            // Apply darkened background color to all buttons
            Array.from(document.querySelectorAll('button')).forEach(button => {
                button.style.backgroundColor = darkenedButtonColor;
                // Add hover effect
                button.addEventListener('mouseover', () => {
                    button.style.backgroundColor = darkenedButtonHoverColor;
                });
                button.addEventListener('mouseout', () => {
                    button.style.backgroundColor = darkenedButtonColor;
                });
            });

            // Apply text color to all elements except radio button labels
            Array.from(document.querySelectorAll('body *')).forEach(element => {
                const tagName = element.tagName.toLowerCase();
                const isRadioLabel = tagName === 'label' && element.previousElementSibling &&
                                     element.previousElementSibling.tagName.toLowerCase() === 'input' &&
                                     element.previousElementSibling.type === 'radio';

                // Avoid changing the color of radio button labels and elements that are already styled with different colors
                const currentBackgroundColor = window.getComputedStyle(element).backgroundColor;
                if (!isRadioLabel && currentBackgroundColor !== rgbaColor) {
                    element.style.color = textColor;
                }
            });
        };



    } catch (error) {
        console.error('Error fetching movie details:', error);
        document.getElementById('movie-details').innerHTML = '<p>Failed to fetch movie details.</p>';
    }
}

// Function to fetch and display the average rating of a movie
async function displayAverageRating(imdbID) {
    try {
        // Query Firestore to get all ratings for the selected movie
        const q = query(collection(db, 'ratings'), where('imdbID', '==', imdbID));
        const querySnapshot = await getDocs(q);

        const ratings = [];
        querySnapshot.forEach((doc) => {
            ratings.push(Number(doc.data().rating)); // Ensure ratings are numbers
        });

        // Calculate the average rating
        const averageRating = ratings.length > 0
            ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
            : 'N/A';

        // Find the existing average rating element or create a new one
        let averageRatingElement = document.getElementById('average-rating');
        if (!averageRatingElement) {
            // If the element doesn't exist, create it
            averageRatingElement = document.createElement('p');
            averageRatingElement.id = 'average-rating';
            document.getElementById('movie-details').appendChild(averageRatingElement);
        }

        // Update the text of the average rating element
        averageRatingElement.innerText = `Average Rating: ${averageRating}/5`;

    } catch (error) {
        console.error('Error fetching average rating:', error);
        let averageRatingElement = document.getElementById('average-rating');
        if (!averageRatingElement) {
            averageRatingElement = document.createElement('p');
            averageRatingElement.id = 'average-rating';
            document.getElementById('movie-details').appendChild(averageRatingElement);
        }
        averageRatingElement.innerText = 'Error fetching average rating';
    }
}



// Utility function to convert RGB to Hex
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Utility function to get a contrasting text color
function getTextColor(bgColor) {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Utility function to adjust color brightness
function adjust(colorHex, amount) {
    let r = parseInt(colorHex.slice(1, 3), 16);
    let g = parseInt(colorHex.slice(3, 5), 16);
    let b = parseInt(colorHex.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));

    return rgbToHex(r, g, b);
}

// Reset movie details and styles
function resetMovieDetails() {
    const elements = [
        'movie-title', 'movie-year', 'movie-rated', 'movie-runtime', 'movie-genre',
        'movie-director', 'movie-writer', 'movie-actors', 'movie-plot', 'movie-language',
        'movie-country', 'movie-awards', 'movie-boxoffice', 'movie-poster', 'rating-response'
    ];

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'movie-poster') {
                element.src = '';
            } else {
                element.innerText = '';
            }
        }
    });

    // Reset background
    document.body.style.setProperty('--bg-image', 'none');
    document.body.classList.remove('show-bg');

    Array.from(document.querySelectorAll('button')).forEach(button => {
                    button.style.backgroundColor = '#007bff';
                    // Add hover effect
                    button.addEventListener('mouseover', () => {
                        button.style.backgroundColor = '#0056b3';
                    });
                    button.addEventListener('mouseout', () => {
                        button.style.backgroundColor = '#007bff';
                    });
                });


    // Reset container background color
    const container = document.querySelector('.container');
    if (container) {
        container.style.backgroundColor = 'rgba(255,255,255, 0.7)';
    }

    const username = document.getElementsByClassName('username');
    Array.from(username).forEach(name => {
        name.style.backgroundColor = 'rgba(255,255,255, 0.7)';
    });

    // Reset colors for detail boxes
    const detailBoxes = document.querySelectorAll('#movie-details .detail-box');
    detailBoxes.forEach(box => {
        box.style.backgroundColor = '';
    });

    // Reset button styles
    Array.from(document.querySelectorAll('button')).forEach(button => {
        button.style.backgroundColor = ''; // Remove inline background color
        button.style.color = ''; // Remove inline text color
        button.style.border = ''; // Remove inline border

        // Remove any hover effects applied directly
        button.classList.remove('button-hover');
    });

    // Reset text color for general elements and radio button labels
    Array.from(document.querySelectorAll('body *')).forEach(element => {
        const tagName = element.tagName.toLowerCase();
        const isRadioLabel = tagName === 'label' && element.previousElementSibling &&
                             element.previousElementSibling.tagName.toLowerCase() === 'input' &&
                             element.previousElementSibling.type === 'radio';

        if (!isRadioLabel) {
            element.style.color = ''; // Reset text color
        }
    });

    // Reset colors for radio button labels
    Array.from(document.querySelectorAll('label')).forEach(label => {
        const input = label.previousElementSibling;
        if (input && input.tagName.toLowerCase() === 'input' && input.type === 'radio') {
            label.style.color = ''; // Reset color for radio button labels
        }
    });

    // Optionally reset any other specific styles or attributes that were changed
}

function rgbToRgba(rgb, alpha) {
    // Check if rgb is a string and contains 'rgb('
    if (typeof rgb === 'string' && rgb.startsWith('rgb(')) {
        // Remove 'rgb(' and ')' from the string and split the values
        const rgbValues = rgb.replace(/^rgb\(|\)$/g, '').split(',').map(Number);
        return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${alpha})`;
    } else if (typeof rgb === 'object' && rgb.r !== undefined && rgb.g !== undefined && rgb.b !== undefined) {
        // Handle rgb object format
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    } else {
        console.log(rgb);
        throw new TypeError('Invalid RGB format');
    }
}
